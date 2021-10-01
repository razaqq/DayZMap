import {
  Control, DomUtil, Map, DomEvent, LeafletMouseEvent, polyline, divIcon, marker, ControlOptions, featureGroup, CircleMarker, LatLng
} from 'leaflet';


// @ts-ignore
Control.Measure = Control.extend({
  options: {
    debounceIntervall: 15,
    measureUnit: 'm',
    measureFactor: 1,
    measureEventCallback: undefined,
    measureInfoType: 'time',
    lineColor: 'black'
  },

  initialize(map: Map): void
  {
    const e = Object.assign({}, this.options, map);
    // @ts-ignore
    Control.prototype.initialize.call(this, e);
    this.debouncing = false;
  },

  addTo(t: Map): HTMLElement | undefined
  {
    this.container = DomUtil.create('a', 'leaflet-control-measure');
    this.container.setAttribute('role', 'button');
    this.map = t;
    this._createButton(this.container, this);
    return this.container;
  },

  _createButton(container: HTMLElement, context: any): HTMLElement
  {
    const link = DomUtil.create('i', '', container);
    link.innerHTML = '\n    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">\n      <path d="M23,8c0,1.1-0.9,2-2,2c-0.18,0-0.35-0.02-0.51-0.07l-3.56,3.55C16.98,13.64,17,13.82,17,14c0,1.1-0.9,2-2,2s-2-0.9-2-2 c0-0.18,0.02-0.36,0.07-0.52l-2.55-2.55C10.36,10.98,10.18,11,10,11s-0.36-0.02-0.52-0.07l-4.55,4.56C4.98,15.65,5,15.82,5,16 c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2c0.18,0,0.35,0.02,0.51,0.07l4.56-4.55C8.02,9.36,8,9.18,8,9c0-1.1,0.9-2,2-2s2,0.9,2,2 c0,0.18-0.02,0.36-0.07,0.52l2.55,2.55C14.64,12.02,14.82,12,15,12s0.36,0.02,0.52,0.07l3.55-3.56C19.02,8.35,19,8.18,19,8 c0-1.1,0.9-2,2-2S23,6.9,23,8z"/>\n    </svg>\n    ';

    DomEvent
      .on(container, 'click', DomEvent.stopPropagation)
      .on(container, 'click', DomEvent.preventDefault)
      .on(container, 'click', this._toggleMeasure, context)
      .on(container, 'dblclick', DomEvent.stopPropagation);

    return link;
  },

  _toggleMeasure(): void
  {
    const t = this;

    if (!this.debouncing)
    {
      this.debouncing = true;

      setTimeout((() => { t.debouncing = false; }), this.options.debounceIntervall);

      this._measuring = !this._measuring;

      if (this._measuring)
      {
        DomUtil.addClass(this.container, 'leaflet-control-measure-on');
        DomUtil.addClass(this.container, 'active');
        this._startMeasuring();
      }
      else
      {
        DomUtil.removeClass(this.container, 'leaflet-control-measure-on');
        DomUtil.removeClass(this.container, 'active');
        this._stopMeasuring();
      }
    }
  },

  _startMeasuring(): void
  {
    this.map._container.style.cursor = 'crosshair';

    DomEvent
      .addListener(this.map, 'mousemove', this._mouseMove, this)
      .addListener(this.map, 'click', this._mouseClick, this)
      .addListener(document.body, 'keydown', this._onKeyDown, this);

    if (!this._layerPaint)
    {
      this._layerPaint = featureGroup().addTo(this.map);
    }

    if (!this._points)
    {
      this._points = [];
    }
  },

  _stopMeasuring(): void
  {
    this.map._container.style.cursor = '';
    DomEvent
      .removeListener(this.map, 'click', this._mouseClick, this)
      .removeListener(this.map, 'mousemove', this._mouseMove, this)
      .removeListener(document.body, 'keydown', this._onKeyDown, this);

    if (this._layerPaint)
    {
      this._layerPaint.clearLayers();
    }

    this._finishPath();
  },

  _mouseMove(t: LeafletMouseEvent): void
  {
    if (!t.latlng || !this._lastPoint)
    {
      return;
    }

    if (!this._layerPaintPathTemp)
    {
      this._layerPaintPathTemp = polyline([this._lastPoint, t.latlng], {
        color: this.options.lineColor,
        weight: 1.5,
        interactive: false,
        dashArray: '5,10'
        // pointerEvents: null
      });

      this._layerPaintPathTemp.setStyle({
        className: 'measure-path'
      });

      this._layerPaintPathTemp.addTo(this._layerPaint);
    }
    else
    {
      this._layerPaintPathTemp.setLatLngs([this._lastPoint, t.latlng]);
    }

    if (this._tooltip)
    {
      if (!this._distance)
      {
        this._distance = 0;
      }
      this._updateTooltipPosition(t.latlng);

      const distance = this._distanceTo(t.latlng, this._lastPoint);
      this._updateTooltipDistance(this._distance + distance, distance);
    }
  },

  _distanceTo(t, e): number
  {
    const n = this.map.project(t, this.map.getMaxZoom());
    const i = this.map.project(e, this.map.getMaxZoom());
    const o = n.x - i.x;
    const r = n.y - i.y;
    return Math.sqrt(o * o + r * r);
  },

  _mouseClick(e: LeafletMouseEvent): void
  {
    // Skip if no coordinates
    if (!e.latlng)
    {
      return;
    }

    this._layerPaint.bringToFront();

    // If we have a tooltip, update the distance and create a new tooltip
    // leaving the old one exactly where it is (i.e. where the user has clicked)
    if (this._lastPoint && this._tooltip)
    {
      if (!this._distance)
      {
        this._distance = 0;
      }
      this._updateTooltipPosition(e.latlng);
      const distance = this._distanceTo(e.latlng, this._lastPoint);
      this._updateTooltipDistance(this._distance + distance, distance);
      this._distance += distance;
    }
    this._createTooltip(e.latlng);

    // If this is already the second click, add the location to the fix path (create one first if we don't have one)
    if (this._lastPoint && !this._layerPaintPath)
    {
      this._layerPaintPath = polyline([this._lastPoint], {
        color: this.options.lineColor,
        weight: 2,
        interactive: false
      }).addTo(this._layerPaint);
    }

    if (this._layerPaintPath)
    {
      this._layerPaintPath.addLatLng(e.latlng);
    }

    this._lastCircle = new CircleMarker(e.latlng, {
        color: this.options.lineColor,
        opacity: 1,
        weight: 1,
        fill: true,
        fillOpacity: 1,
        radius: 3,
        interactive: Boolean(this._lastCircle)
      }).addTo(this._layerPaint);

    this._lastCircle.on('click', (() => {this._finishPath(); }), this);

    // Save current location as last location
    this._lastPoint = e.latlng;
  },

  _finishPath(): void
  {
    if (this._tooltip)
    {
      this._layerPaint.removeLayer(this._tooltip);
    }
    if (this._layerPaint && this._layerPaintPathTemp)
    {
      this._layerPaint.removeLayer(this._layerPaintPathTemp);
    }

    // Reset everything
    this._restartPath();
  },

  _restartPath(): void
  {
    this._distance = 0;
    this._tooltip = undefined;
    this._lastCircle = undefined;
    this._lastPoint = undefined;
    this._layerPaintPath = undefined;
    this._layerPaintPathTemp = undefined;
  },

  _createTooltip(position: LatLng): void
  {
    const ico = divIcon({
      className: 'leaflet-measure-tooltip',
      iconAnchor: [-5, -5]
    });

    this._tooltip = marker(position, {
      icon: ico,
      interactive: false
    }).addTo(this._layerPaint);
  },

  _updateTooltipPosition(position: LatLng): void
  {
    this._tooltip.setLatLng(position);
  },

  _updateTooltipDistance(total: number, difference: number): void
  {
    const n = this;
    const distanceDifference = this._roundWithMeasureFactor(difference);
    const distanceTotal = this._roundWithMeasureFactor(total);
    const r = this._getTime(this._getRunTime(distanceTotal));
    const s = this._getTime(this._getSprintTime(distanceTotal));
    const a = this._getTime(this._getRunTime(distanceDifference));
    const l = this._getTime(this._getSprintTime(distanceDifference));

    // tslint:disable-next-line:max-line-length
    const c = '\n    <div class="flex">\n      <table>\n        <tr class="leaflet-measure-tooltip-total">\n          <td>' + this._getFormattedDistance(distanceTotal) + '</td>\n          <td class="measure-extend-info px-2 hidden">\n            <div class="flex">\n              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">\n                <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>\n              </svg>\n              ' + r + '\n            </div>\n          </td>\n          <td class="measure-extend-info px-2 hidden">\n            <div class="flex">\n              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">\n                <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>\n              </svg>\n              ' + s + '\n            </div>\n          </td>\n        </tr>\n        <tr class="leaflet-measure-tooltip-difference">\n          <td>\n            + ' + this._getFormattedDistance(distanceDifference) + '\n          </td>\n          <td class="measure-extend-info px-2 hidden">\n            <div class="flex">\n              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">\n                <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>\n              </svg>\n              ' + a + '\n            </div>\n          </td>\n          <td class="measure-extend-info px-2 hidden">\n            <div class="flex">\n              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">\n                <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>\n              </svg>\n              ' + l + '\n            </div>\n          </td>\n        </tr>\n      </table>\n      <button class="leaflet-measure-extend flex items-center">\n        <svg id="chevron_left" class="w-4 h-4 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">\n          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />\n        </svg>\n        <svg id="chevron_right" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">\n          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />\n        </svg>\n      </button>\n    </div>\n    ';

    this._expanded = false;
    this._tooltip._icon.innerHTML = c;

    const u = this._tooltip._icon.querySelector('button');
    const h = u.querySelector('#chevron_left');
    const p = u.querySelector('#chevron_right');
    const d = this._tooltip._icon.querySelectorAll('.measure-extend-info');

    u.addEventListener('click', ((e: Event) => {
      n._expanded = !n._expanded;

      if (n._expanded)
      {
        h.classList.remove('hidden');
        p.classList.add('hidden');
        d.forEach(elem => elem.classList.remove('hidden'));
      }
      else
      {
        h.classList.add('hidden');
        p.classList.remove('hidden');
        d.forEach(elem => elem.classList.add('hidden'));
      }

      e.preventDefault();
      e.stopPropagation();
    }));
  },

  _getFormattedDistance(distance: number): string
  {
      return distance.toLocaleString() + this.options.measureUnit;
  },

  _getRunTime(distance: number): number
  {
    return distance / this.options.runningTimeFactor;
  },

  _getSprintTime(distance: number): number
  {
    return distance / this.options.sprintingTimeFactor;
  },

  _getTime(runtime: number): string
  {
    const e = Math.floor(runtime / 3600);
    const n = Math.floor(runtime / 60 - 60 * e);
    runtime = Math.floor(runtime % 3600 % 60);
    return (e > 0 ? e + 'h' : '') + (e > 0 || n > 0 ? n + 'min' : '') + (e > 0 ? n > 0 ? '' : runtime + 's' : (n > 0 ? ' ' : '') + runtime + 's');
  },

  _roundWithMeasureFactor(distance: number): number
  {
    return Math.round(distance * this.options.measureFactor);
  },

  _onKeyDown(_: Event): void
  {
    this._lastPoint ? this._finishPath() : this._toggleMeasure();
  }
});


export function measureControl(options: ControlOptions): Control
{
  // @ts-ignore
  return new Control.Measure(options);
}

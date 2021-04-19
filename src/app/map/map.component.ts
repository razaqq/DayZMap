import {Component, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {
  Map, Layer, MapOptions, TileLayer, CRS, tileLayer,
  TileLayerOptions, LeafletMouseEvent, LeafletEvent
} from 'leaflet';

import {armaCoordsToString, mapToArmaCoords} from './util';
import {LeafletControlLayersConfig} from '@asymmetrik/ngx-leaflet/src/leaflet/layers/control/leaflet-control-layers-config.model';
import {MapMarker} from '../markers/map-marker';
import {MarkersService} from '../markers/markers.service';
import {AppConfig} from '../app.config';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnDestroy
{
  @Output() map$: EventEmitter<Map> = new EventEmitter();
  @Output() zoom$: EventEmitter<number> = new EventEmitter();

  options: MapOptions = {
    crs: CRS.Simple,
    zoom: this.config.get('initZoom'),
    minZoom: this.config.get('minZoom'),
    maxZoom: this.config.get('maxZoom'),
    center: this.config.get('center'),
    preferCanvas: true
  };
  layerOptions: TileLayerOptions = {
    noWrap: true,
    zIndex: 0,
    tileSize: this.config.get('tileSize'),
    bounds: this.config.get('bounds'),
    updateWhenZooming: false,
    updateWhenIdle: false
  };
  satLayer: TileLayer = tileLayer(this.config.get('satURL'), this.layerOptions);
  topoLayer: TileLayer = tileLayer(this.config.get('topoURL'), this.layerOptions);
  layers: Layer[] = [this.satLayer];
  layersControl: LeafletControlLayersConfig = {
    baseLayers:
      {
        Satellite: this.satLayer,
        Topography: this.topoLayer
      },
    overlays: {}
  };
  layersControlOptions: any = { position: 'topright' };

  coords = '000 | 000';
  map: Map;
  zoom: number;
  mapSize: number;
  maxBounds: number;

  constructor(private markersService: MarkersService, private config: AppConfig, private clipboard: Clipboard)
  {
    this.markersService.disableFilterSource$.subscribe(markers => this.changeMarkerVisibility(markers, false));
    this.markersService.enableFilterSource$.subscribe(markers => this.changeMarkerVisibility(markers, true));

    // lets copy these so we dont have to call lookup all the time
    this.maxBounds = this.config.get('maxBounds');
    this.mapSize = this.config.get('mapSize');
  }

  ngOnDestroy(): void
  {
    this.markersService.disableFilterSource$.unsubscribe();
    this.markersService.enableFilterSource$.unsubscribe();
    this.map.clearAllEventListeners();
    this.map.remove();
  }

  onMapReady(map: Map): void
  {
    this.map = map;
    this.map$.emit(map);

    this.zoom = map.getZoom();
    this.zoom$.emit(this.zoom);
  }

  onMapZoomEnd(e: LeafletEvent): void
  {
    this.zoom = e.target.getZoom();
    this.zoom$.emit(this.zoom);
  }

  onMouseMove(e: LeafletMouseEvent): void
  {
    this.coords = armaCoordsToString(e.latlng.lat, e.latlng.lng, this.mapSize, this.maxBounds);
  }

  onMouseDown(e: LeafletMouseEvent): void
  {
    if (e.originalEvent.button === 2)
    {
      const coords = mapToArmaCoords(e.latlng.lat, e.latlng.lng, this.mapSize, this.maxBounds);
      const coordsString = `[${coords[0]}, ${coords[1]}]`;
      this.clipboard.copy(coordsString);
      console.log(coordsString);
    }
  }

  onRightClick(_: MouseEvent): boolean
  {
    return false;
  }

  changeMarkerVisibility(markers: MapMarker[], visible: boolean): void
  {
    for (const mapMarker of markers)
    {
      for (const m of mapMarker.markers)
      {
        if (this.map.hasLayer(m) && !visible)
        {
          this.map.removeLayer(m);
        }
        else if (!this.map.hasLayer(m) && visible)
        {
          this.map.addLayer(m);
        }
      }
    }
  }
}

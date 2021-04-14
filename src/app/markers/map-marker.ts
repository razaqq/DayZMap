import {Marker, Icon, marker, DivIcon} from 'leaflet';
import {armaCoordsToMap} from '../map/util';


export interface MapMarker
{
  name: string;
  icon: string;
  fontSize: number;
  category: string;
  locations?: Array<[number, number]>;
  markers?: Array<Marker>;
}

export function initVehicleMarker(mapMarker: MapMarker, mapSize: number, maxBounds: number): void
{
  if (!('locations' in mapMarker))
  {
    mapMarker.locations = [];
  }

  const leafletIcon = new Icon({
    iconUrl: mapMarker.icon,
    iconSize: [25, 25],
    className: 'vehicleMarker'
  });

  mapMarker.markers = [];
  for (const loc of mapMarker.locations)
  {
    const m = marker(armaCoordsToMap(...loc, mapSize, maxBounds), {icon: leafletIcon});
    m.bindTooltip(mapMarker.name, {className: 'mapMarkerTooltip'});
    mapMarker.markers.push(m);
  }
}

export function initLocationMarker(mapMarker: MapMarker, mapSize: number, maxBounds: number): void
{
  if (!('locations' in mapMarker))
  {
    mapMarker.locations = [];
  }
  mapMarker.icon = '';

  const leafletIcon = new DivIcon({
    html: '<div style="font-size: ' + mapMarker.fontSize + 'pt">' + mapMarker.name + '</div>',
    className: 'locationMarker'
  });

  mapMarker.markers = [];
  for (const loc of mapMarker.locations)
  {
    const m = marker(armaCoordsToMap(...loc, mapSize, maxBounds), {icon: leafletIcon});
    mapMarker.markers.push(m);
  }
}

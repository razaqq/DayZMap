import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {initLocationMarker, initLootMarker, initVehicleMarker, MapMarker} from './map-marker';
import {Subject} from 'rxjs';
import {Filter, buildFilters} from './filter';
import {AppConfig} from '../app.config';
import {polygon, Polygon, PolylineOptions} from 'leaflet';
import {armaCoordsToMap} from '../map/util';


@Injectable({
  providedIn: 'root'
})
export class MarkersService {
  vehiclesURL = './assets/data/vehicles.json';
  locationsURL = './assets/data/locations.json';
  lootURL = './assets/data/loot.json';
  dayz2NobuildURL = './assets/data/dayz2-nobuild.json';
  europaNobuildURL = './assets/data/europa-nobuild.json';

  vehicleFilters: Filter[];
  lootFilters: Filter[];
  locationFilters: Filter[];
  areaFilters: Filter[] = [];

  enableFilterSource$ = new Subject<MapMarker[]>();
  disableFilterSource$ = new Subject<MapMarker[]>();

  enableFilterPolySource$ = new Subject<Polygon[]>();
  disableFilterPolySource$ = new Subject<Polygon[]>();

  constructor(private http: HttpClient, private config: AppConfig)
  {
    this.http.get<MapMarker[]>(this.vehiclesURL).subscribe(vehicles => {
      vehicles.forEach(veh => initVehicleMarker(veh, this.config.get('mapSize'), this.config.get('maxBounds')));
      this.vehicleFilters = buildFilters(vehicles);
      this.enableFilterSource$.next(vehicles);
    }, error => { console.error('Failed to get vehicle markers: ', error); });

    this.http.get<MapMarker[]>(this.locationsURL).subscribe(locations => {
      locations.forEach(loc => initLocationMarker(loc, this.config.get('mapSize'), this.config.get('maxBounds')));
      this.locationFilters = buildFilters(locations);
      this.enableFilterSource$.next(locations);
    }, error => { console.error('Failed to get location markers: ', error); });

    this.http.get<MapMarker[]>(this.lootURL).subscribe(loot => {
      loot.forEach(l => initLootMarker(l, this.config.get('mapSize'), this.config.get('maxBounds')));
      this.lootFilters = buildFilters(loot);
      this.enableFilterSource$.next(loot);
    }, error => { console.error('Failed to get loot markers: ', error); });

    this.http.get<[number, number][][]>(this.europaNobuildURL).subscribe(polys => {
      const polygons: Polygon[] = this.generatePolygons(polys, {color: 'red'});
      this.areaFilters.push({
        name: 'Europa NoBuild',
        polygons,
        visible: false,
        color: 'primary'
      });
    }, error => { console.error('Failed to get dayz2 nobuild markers: ', error); });

    this.http.get<[number, number][][]>(this.dayz2NobuildURL).subscribe(polys => {
      const polygons: Polygon[] = this.generatePolygons(polys, {color: '#56009c'});
      this.areaFilters.push({
        name: 'DayZ 2.0 NoBuild',
        polygons,
        visible: false,
        color: 'primary'
      });
    }, error => { console.error('Failed to get dayz2 nobuild markers: ', error); });
  }

  setFilterVisibility(filter: Filter, visible: boolean): void
  {
    if ('markers' in filter)
    {
      visible ? this.enableFilterSource$.next(filter.markers) : this.disableFilterSource$.next(filter.markers);
    }
    if ('polygons' in filter)
    {
      visible ? this.enableFilterPolySource$.next(filter.polygons) : this.disableFilterPolySource$.next(filter.polygons);
    }
  }

  generatePolygons(polys: [number, number][][], options: PolylineOptions): Polygon[]
  {
    const polygons: Polygon[] = [];

    for (const poly of polys)
    {
      const coordinates: [number, number][] = [];
      for (const coordPair of poly)
      {
        coordinates.push(armaCoordsToMap(...coordPair, this.config.get('mapSize'), this.config.get('maxBounds')));
      }
      polygons.push(polygon(coordinates, options));
    }
    return polygons;
  }
}

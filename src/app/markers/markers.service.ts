import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {initLocationMarker, initLootMarker, initVehicleMarker, MapMarker} from './map-marker';
import {Subject} from 'rxjs';
import {Filter, buildFilters} from './filter';
import {AppConfig} from '../app.config';


@Injectable({
  providedIn: 'root'
})
export class MarkersService {
  vehiclesURL = './assets/data/vehicles.json';
  locationsURL = './assets/data/locations.json';
  lootURL = './assets/data/loot.json';

  vehicleFilters: Filter[];
  lootFilters: Filter[];
  locationFilters: Filter[];

  enableFilterSource$ = new Subject<MapMarker[]>();
  disableFilterSource$ = new Subject<MapMarker[]>();

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
  }

  setFilterVisibility(filter: Filter, visible: boolean): void
  {
    visible ? this.enableFilterSource$.next(filter.markers) : this.disableFilterSource$.next(filter.markers);
  }
}

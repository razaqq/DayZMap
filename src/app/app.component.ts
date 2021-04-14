import { Component } from '@angular/core';
import { Map } from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})

export class AppComponent
{
  private map: Map;
  private zoom: number;
  title = 'DayZMap';

  constructor() {}

  receiveMap(map: Map): void
  {
    this.map = map;
  }

  receiveZoom(zoom: number): void
  {
    this.zoom = zoom;
  }
}

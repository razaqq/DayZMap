import {Inject, Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

interface Config
{
  mapSize: number;
  tileSize: number;
  satURL: string;
  topoURL: string;
  bounds: [[number, number], [number, number]];
  maxBounds: number;
  center: [number, number];
  minZoom: number;
  maxZoom: number;
  initZoom: number;
}

@Injectable()
export class AppConfig {
  private config: Config = null;

  constructor(private http: HttpClient) {}

  public get(key: string): any
  {
    return this.config[key];
  }

  public load(): Promise<any>
  {
    return new Promise((resolve, reject) => {
      this.http.get<Config>('./assets/config.json').subscribe(res => {
        this.config = res;
        resolve(true);
      }, error => {
        console.error('Error reading configuration file');
        resolve(error);
      });
    });
  }
}

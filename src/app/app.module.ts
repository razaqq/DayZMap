import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {MapComponent} from './map/map.component';
import {AppComponent} from './app.component';
import {FiltersDialogComponent} from './filter/filter-dialog.component';
import {FilterComponent} from './filter/filter.component';
import {ToolbarComponent} from './toolbar/toolbar.component';
import {MaterialModule} from './material.module';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {AppConfig} from './app.config';


@NgModule({
  imports: [BrowserModule, FormsModule, LeafletModule, MaterialModule, ReactiveFormsModule, MatDialogModule, MatCheckboxModule,
    BrowserAnimationsModule, MatTooltipModule, HttpClientModule],
  declarations: [ AppComponent, MapComponent, FiltersDialogComponent, FilterComponent, ToolbarComponent ],
  bootstrap:    [ AppComponent ],
  providers:    [ AppConfig,
    { provide: APP_INITIALIZER, useFactory: (config: AppConfig) => () => config.load(), deps: [AppConfig], multi: true }
  ]
})
export class AppModule { }

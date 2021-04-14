import {Component, Input} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {Filter} from '../markers/filter';
import {MarkersService} from '../markers/markers.service';


@Component({
  selector: 'app-filter',
  templateUrl: 'filter.component.html',
  styleUrls: ['filter.component.css'],
})
export class FilterComponent
{
  @Input() filters: Array<Filter> = [];
  @Input() name: string;
  @Input() icon: string;
  @Input() color: ThemePalette = 'primary';

  allVisible = false;

  constructor(private markersService: MarkersService) {}

  updateAllComplete(): void
  {
    this.allVisible = this.filters.every(f => f.visible);
  }

  someComplete(): boolean
  {
    return this.filters.filter(f => f.visible).length > 0 && !this.allVisible;
  }

  setAll(visible: boolean): void
  {
    this.allVisible = visible;
    this.filters.forEach(f => {f.visible = visible; this.onChange(f, visible); });
  }

  onChange(filter: Filter, checked: boolean): void
  {
      this.markersService.setFilterVisibility(filter, checked);
  }
}

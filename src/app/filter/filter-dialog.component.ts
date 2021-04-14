import {Component, Input} from '@angular/core';
import {MarkersService} from '../markers/markers.service';


@Component({
  selector: 'app-filters',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.css'],
})
export class FiltersDialogComponent
{
  @Input() labelText: string;

  constructor(public markersService: MarkersService) {}
}

import {Component} from '@angular/core';
import {FiltersDialogComponent} from '../filter/filter-dialog.component';
import {MatDialog} from '@angular/material/dialog';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent
{
  constructor(public dialog: MatDialog) {}

  openFiltersDialog(): void
  {
    const dialogRef = this.dialog.open(FiltersDialogComponent, {
      width: '75%',
      data: {}
    });

    /*
    dialogRef.afterClosed().subscribe(result =>
    {
    });
    */
  }
}

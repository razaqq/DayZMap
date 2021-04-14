import {ThemePalette} from '@angular/material/core';
import {MapMarker} from './map-marker';

export interface Filter
{
  name: string;
  icon?: string;
  visible: boolean;
  color: ThemePalette;
  markers: Array<MapMarker>;
}

export function buildFilters(markers: Array<MapMarker>): Array<Filter>
{
  const filters: Array<Filter> = [];
  for (const mapMarker of markers)
  {
    let found = false;
    for (const filter of filters)
    {
      if (filter.name === mapMarker.category)
      {
        filter.markers.push(mapMarker);
        found = true;
        break;
      }
    }
    if (!found)
    {
      const filter =
        {
          name: mapMarker.category,
          icon: mapMarker.icon,
          visible: true,
          color: 'primary',
          markers: [mapMarker]
        } as Filter;
      filters.push(filter);
    }
  }

  filters.sort((a, b) => (a.name < b.name ? -1 : 1));
  return filters;
}

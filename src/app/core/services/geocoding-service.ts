import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { GeocodingRepository } from '../repositories/geocoding-repository';
import {Location} from '../models/location-model';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  constructor(private readonly repo: GeocodingRepository) {}

  getPlaceName(location: Location): Observable<string> {
    return this.repo.reverseGeocode(location).pipe(
      map((response) => {
        return response.display_name.split(',').slice(0, -1).join(',')
      }),
      catchError((error) => {
        console.error('Erreur reverse geocoding :', error);
        return of('Inconnu');
      })
    );
  }

  getRegions(): Observable<string[]> {
    return of(["Bonoua"]);
  }
}

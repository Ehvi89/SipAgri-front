import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { GeocodingRepository } from '../repositories/geocoding-repository';
import {Location} from '../models/location-model';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  constructor(private repo: GeocodingRepository) {}

  getPlaceName(location: Location): Observable<string> {
    return this.repo.reverseGeocode(location).pipe(
      map((response) => response.display_name.split(',').slice(0, -1) || 'Inconnu'),
      catchError((error) => {
        console.error('Erreur reverse geocoding :', error);
        return of('Inconnu');
      })
    );
  }
}

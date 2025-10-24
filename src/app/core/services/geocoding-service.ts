import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, finalize, map, Observable, of, tap} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GeocodingRepository } from '../repositories/geocoding-repository';
import { Location } from '../models/location-model';

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  address?: {
    village?: string;
    town?: string;
    city?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly _geoLoading = new BehaviorSubject<boolean>(false);
  get geoLoading() {
    return this._geoLoading.asObservable();
  }
  private setGeoLoading(loading: boolean) {
    this._geoLoading.next(loading);
  }

  constructor(
    private readonly repo: GeocodingRepository,
    private readonly http: HttpClient
  ) {}

  getPlaceName(location: Location): Observable<string> {
    this.setGeoLoading(true)
    return this.repo.reverseGeocode(location).pipe(
      map((response) => {
        return response.display_name.split(',').slice(0, -1).join(',')
      }),
      catchError((error) => {
        console.error('Erreur reverse geocoding :', error);
        return of('Inconnu');
      }),
      finalize(() => this.setGeoLoading(false)),
    );
  }

  // Nouvelle méthode pour rechercher des locations
  searchLocations(searchTerm: string): Observable<NominatimResult[]> {
    // Configuration pour rechercher principalement des villages en Côte d'Ivoire
    const url = `https://nominatim.openstreetmap.org/search?` +
      `format=json&` +
      `q=${encodeURIComponent(searchTerm)}&` +
      `addressdetails=1&` +
      `limit=10&` +
      `countrycodes=ci&` + // Restreindre à la Côte d'Ivoire
      `type=village,town,city,municipality`; // Types de lieux pertinents

    this.setGeoLoading(true);
    return this.http.get<NominatimResult[]>(url).pipe(
      map((response) => {
        return response.map(address => ({
          ...address,
          display_name: address.display_name.split(',').slice(0, -1).join(',')}))
      }),
      catchError((error) => {
        console.error('Erreur de recherche Nominatim:', error);
        return of([]);
      }),
      finalize(() => this.setGeoLoading(false)),
    );
  }

  getRegions(): Observable<string[]> {
    return of(["Bonoua"]);
  }
}

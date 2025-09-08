import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Location} from '../models/location-model';

@Injectable({ providedIn: 'root' })
export class GeocodingRepository {
  private apiUrl = 'https://nominatim.openstreetmap.org/reverse';

  constructor(private http: HttpClient) {}

  reverseGeocode(location: Location): Observable<any> {
    const url = `${this.apiUrl}?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=10&addressdetails=1`;
    return this.http.get<any>(url);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleMapsService {

  /**
   *
   */
  private loader$?: ReplaySubject<void>;
  /**
   * A boolean variable that indicates whether a certain process, task, or state is ready or completed.
   * The default value is `false`, suggesting that the readiness is not achieved.
   */
  private ready = false;

  /**
   * A BehaviorSubject holding the central geographical coordinates of the map,
   * represented as a `google.maps.LatLngLiteral` object.
   *
   * The object contains latitude (`lat`) and longitude (`lng`) values
   * and is initialized with a default location.
   *
   * Example coordinate values:
   * lat: 5.36
   * lng: -4.0083
   */
  private readonly _mapCenter = new BehaviorSubject<google.maps.LatLngLiteral>({
    lat: 5.36,
    lng: -4.0083
  });
  /**
   * Observable that emits the current center coordinates of the map.
   *
   * @return {Observable<google.maps.LatLngLiteral>} An observable emitting the map's center as a LatLngLiteral object.
   */
  get mapCenter$(): Observable<google.maps.LatLngLiteral> {
    return this._mapCenter.asObservable();
  }

  /**
   * Represents the zoom level for a map display.
   * This value determines the scale of the map, where a higher number provides a closer, more detailed view,
   * and a lower number provides a wider, less detailed view.
   *
   * @type {number}
   */
  mapZoom: number = 15;
  /**
   * Configuration options for initializing a Google Maps instance.
   * This variable holds an object specifying map initialization settings such as center, zoom level,
   * mapType, and other map features supported by the Google Maps API.
   *
   * @type {google.maps.MapOptions}
   */
  mapOptions!: google.maps.MapOptions;
  /**
   * Represents the options for a selected marker in a Google Maps implementation.
   * It is used to configure the appearance, behavior, and functionality of an advanced marker element.
   *
   * @type {google.maps.marker.AdvancedMarkerElementOptions}
   */
  selectedMarkerOptions!: google.maps.marker.AdvancedMarkerElementOptions;

  /**
   * Loads the Google Maps SDK and ensures it is ready for use. If the SDK is already loaded,
   * it will immediately return a completed Observable. If the SDK is currently in the process
   * of loading, it will return the in-progress Observable. Otherwise, it will initiate loading
   * the SDK and return an Observable that emits when loading is complete or an error occurs.
   *
   * @return {Observable<void>} An Observable that emits when the Google Maps SDK is fully loaded
   * or emits an error if loading fails.
   */
  load(): Observable<void> {
    if (this.ready) {
      // Déjà chargé → on renvoie un Observable qui a déjà émis
      const ready$ = new ReplaySubject<void>(1);
      ready$.next();
      ready$.complete();
      return ready$;
    }

    if (this.loader$) {
      return this.loader$; // Déjà en cours de chargement
    }

    this.loader$ = new ReplaySubject<void>(1);

    // Vérifie si Google Maps est déjà dispo dans la fenêtre
    if ((globalThis as any).google?.maps) {
      this.ready = true;
      this.setupDefaultMapOptions();
      this.loader$.next();
      this.loader$.complete();
      return this.loader$;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if ((globalThis as any).google?.maps) {
        this.ready = true;
        this.setupDefaultMapOptions();
        this.loader$?.next();
        this.loader$?.complete();
      } else {
        this.loader$?.error(new Error('Google Maps SDK non disponible après chargement'));
      }
    };

    script.onerror = () => {
      this.loader$?.error(new Error('Erreur de chargement du script Google Maps'));
    };

    document.head.appendChild(script);

    return this.loader$;
  }

  /**
   * Configures and sets up the default map options for rendering a Google Maps.
   * The options include controls, zoom behavior, map type, and gesture handling.
   *
   * @return {void} No return value as the method initializes the mapOptions property.
   */
  private setupDefaultMapOptions(): void {
    this.mapOptions = {
      mapTypeId: google.maps.MapTypeId.HYBRID,
      disableDoubleClickZoom: false,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      scaleControl: true,
      rotateControl: false,
      gestureHandling: 'cooperative'
    };
  }

  /**
   * Updates the map center, zoom level, and selected marker options based on the provided coordinates and title.
   *
   * @param {number} lat - The latitude coordinate of the plantation to select.
   * @param {number} lng - The longitude coordinate of the plantation to select.
   * @param {string} title - The title or label for the selected plantation marker.
   * @return {void} This method does not return a value.
   */
  selectPlantation(lat: number, lng: number, title: string): void {
    this._mapCenter.next({ lat, lng });
    this.mapZoom = 15;
    this.selectedMarkerOptions = { title };
  }
}

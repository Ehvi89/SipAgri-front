import { Injectable, inject } from '@angular/core';
import { Environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GoogleMapsService {
  private readonly environment = inject(Environment);

  /** Observable qui émet quand Google Maps est prêt */
  private loader$?: ReplaySubject<void>;
  private ready = false;

  private _mapCenter = new BehaviorSubject<google.maps.LatLngLiteral>({
    lat: 5.3600,
    lng: -4.0083
  });
  get mapCenter$(): Observable<google.maps.LatLngLiteral> {
    return this._mapCenter.asObservable();
  }

  mapZoom = 16;
  mapOptions!: google.maps.MapOptions;
  selectedMarkerOptions!: google.maps.marker.AdvancedMarkerElementOptions;

  /** Charge le SDK Google Maps une seule fois */
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
    if ((window as any).google?.maps) {
      this.ready = true;
      this.setupDefaultMapOptions();
      this.loader$.next();
      this.loader$.complete();
      return this.loader$;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.environment.googleMapsApiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if ((window as any).google?.maps) {
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

  /** Vérifie si Google Maps est dispo */
  isReady(): boolean {
    return this.ready && !!(window as any).google?.maps;
  }

  /** Configure les options par défaut */
  private setupDefaultMapOptions(): void {
    this.mapOptions = {
      mapTypeId: google.maps.MapTypeId.HYBRID,
      scrollwheel: true,
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

  /** Sélection d’une plantation → recadrage + marker animé */
  selectPlantation(lat: number, lng: number, title: string): void {
    this._mapCenter.next({ lat, lng });
    this.mapZoom = 16;
    this.selectedMarkerOptions = { title };
  }

  /** Réinitialisation de la carte */
  resetMapView(): void {
    this._mapCenter.next({ lat: 5.3600, lng: -4.0083 });
    this.mapZoom = 16;
    this.selectedMarkerOptions = {};
  }

  /** Calculer bounds et recentrer la carte */
  calculateMapBounds(locations: google.maps.LatLngLiteral[]): void {
    if (!this.isReady() || locations.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    locations.forEach(location => bounds.extend(location));

    this._mapCenter.next(bounds.getCenter().toJSON());
    this.mapZoom = locations.length === 1 ? 16 : 15;
  }
}

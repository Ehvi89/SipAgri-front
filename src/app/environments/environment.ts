import { EnvironmentDev } from './environment-dev';
import {EnvironmentProd} from './environment-prod';
import {Injectable} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Environment extends EnvironmentDev {
  readonly googleMapsApiKey: string = "AIzaSyCNmk3eEvUOs1NPMP2tvrDuPnpuEHBWxPM";
}

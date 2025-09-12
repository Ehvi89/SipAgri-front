import { EnvironmentDev } from './environment-dev';
import {EnvironmentProd} from './environment-prod';
import {Injectable} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Environment extends EnvironmentDev {
}

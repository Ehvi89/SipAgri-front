import {Location} from './location-model';
import {Production} from './production-model';
import {Kit} from './kit-model';

export interface Plantation {
  id?: number;
  gpsLocation: Location,
  farmedArea: number,
  productions: Production [],
  planterId: number,
  kit: Kit
}

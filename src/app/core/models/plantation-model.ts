import {Location} from './location-model';
import {Production} from './production-model';
import {Kit} from './kit-model';
import {PlantationStatus} from '../enums/plantation-status-enum';

export interface Plantation {
  id?: number;
  name: string;
  description: string;
  gpsLocation: Location,
  farmedArea: number,
  productions: Production [],
  planterId: number,
  kit: Kit,
  status: PlantationStatus,
  sector: string
}

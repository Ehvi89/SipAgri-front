import {Supervisor} from './supervisor-model';
import {Gender} from '../enums/gender-enum';
import {MaritalStatus} from '../enums/marital-status-enum';
import {Plantation} from './plantation-model';

export interface Planter {
  id?: number;
  firstname: string,
  lastname: string,
  birthday: Date,
  gender: Gender,
  maritalStatus: MaritalStatus,
  phoneNumber: number,
  childrenNumber: number,
  village: string,
  supervisor: Supervisor,
  plantations?: Plantation[]
}

import {SupervisorProfile} from '../enums/supervisor-profile';

export interface Supervisor {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  profile: SupervisorProfile;
}

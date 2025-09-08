import {KitProduct} from './kit-product-model';

export interface Kit {
  id?: number;
  name: string;
  description: string;
  totalCost: number;
  kitProducts: KitProduct[];
}

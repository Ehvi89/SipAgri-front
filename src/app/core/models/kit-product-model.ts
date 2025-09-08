import {Product} from './product-model';

export interface KitProduct {
  id?: number,
  product: Product,
  totalCost: number,
  quantity: number,
}

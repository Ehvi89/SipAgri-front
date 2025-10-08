import {Injectable} from '@angular/core';
import { BaseRepository } from "../../../../../core/repositories/base-repository";
import { Product } from "../../../../../core/models/product-model";

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  protected override endpoint = "products";
}

import {Injectable} from '@angular/core';
import { BaseService } from "../../../../../core/services/base-service";
import { Product } from "../../../../../core/models/product-model";
import {ProductRepository} from '../repositories/product-repository';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(private productRepository: ProductRepository) {
    super(productRepository);
  }
}

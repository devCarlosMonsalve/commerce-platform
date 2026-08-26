import { Inject, Injectable } from '@nestjs/common';
import { ProductEntity } from '../../domain/product.entity';
import { PRODUCT_REPOSITORY } from '../../domain/product.repository';
import type { IProductRepository } from '../../domain/product.repository';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  execute(organizationId: string): Promise<ProductEntity[]> {
    return this.productRepository.findAllByOrganization(organizationId);
  }
}

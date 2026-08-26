import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductEntity } from '../../domain/product.entity';
import { PRODUCT_REPOSITORY } from '../../domain/product.repository';
import type { IProductRepository } from '../../domain/product.repository';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(organizationId: string, productId: string): Promise<ProductEntity> {
    const product = await this.productRepository.findById(productId);
    if (!product || product.organizationId !== organizationId) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}

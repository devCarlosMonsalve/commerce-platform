import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/product.repository';
import type { IProductRepository } from '../../domain/product.repository';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(organizationId: string, productId: string): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product || product.organizationId !== organizationId) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.delete(productId);
  }
}

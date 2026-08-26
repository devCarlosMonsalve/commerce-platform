import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { ProductEntity } from '../../domain/product.entity';
import { PRODUCT_REPOSITORY } from '../../domain/product.repository';
import type { IProductRepository } from '../../domain/product.repository';
import { UpdateProductDto } from '../dtos/update-product.dto';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    organizationId: string,
    productId: string,
    dto: UpdateProductDto,
  ): Promise<ProductEntity> {
    const product = await this.productRepository.findById(productId);
    if (!product || product.organizationId !== organizationId) {
      throw new NotFoundException('Product not found');
    }

    return this.productRepository.update(productId, {
      name: dto.name,
      description: dto.description,
      sku: dto.sku,
      price: dto.price === undefined ? undefined : new Decimal(dto.price),
      stock: dto.stock,
    });
  }
}

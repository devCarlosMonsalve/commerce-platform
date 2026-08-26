import { Inject, Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { ProductEntity } from '../../domain/product.entity';
import { PRODUCT_REPOSITORY } from '../../domain/product.repository';
import type { IProductRepository } from '../../domain/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  execute(organizationId: string, dto: CreateProductDto): Promise<ProductEntity> {
    return this.productRepository.create({
      organizationId,
      name: dto.name,
      description: dto.description,
      sku: dto.sku,
      price: new Decimal(dto.price),
      stock: dto.stock,
    });
  }
}

import { ProductStatus } from '@prisma/client';
import { ProductEntity } from '../../domain/product.entity';

export class ProductResponse {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: string;
  stock: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;

  static from(entity: ProductEntity): ProductResponse {
    const dto = new ProductResponse();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.sku = entity.sku;
    dto.price = entity.price.toString();
    dto.stock = entity.stock;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

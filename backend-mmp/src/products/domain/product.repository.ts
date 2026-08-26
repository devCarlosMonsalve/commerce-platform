import { ProductStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ProductEntity } from './product.entity';

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

export interface IProductRepository {
  findById(id: string): Promise<ProductEntity | null>;
  findAllByOrganization(organizationId: string): Promise<ProductEntity[]>;
  create(data: {
    organizationId: string;
    name: string;
    description?: string;
    sku?: string;
    price: Decimal;
    stock?: number;
  }): Promise<ProductEntity>;
  update(id: string, data: {
    name?: string;
    description?: string;
    sku?: string;
    price?: Decimal;
    stock?: number;
    status?: ProductStatus;
  }): Promise<ProductEntity>;
  delete(id: string): Promise<void>;
}

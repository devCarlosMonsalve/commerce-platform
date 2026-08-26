import { ProductStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly sku: string | null,
    public readonly price: Decimal,
    public readonly stock: number,
    public readonly status: ProductStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

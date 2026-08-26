import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderItemEntity } from './order-item.entity';

export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly customerId: string | null,
    public readonly status: OrderStatus,
    public readonly total: Decimal,
    public readonly items: OrderItemEntity[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderItemEntity } from './order-item.entity';
import { OrderDomainError } from './order-domain.error';

export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly customerId: string,
    public readonly status: OrderStatus,
    public readonly total: Decimal,
    public readonly items: OrderItemEntity[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  submit(): OrderEntity {
    return this.transitionTo(OrderStatus.PENDING, [OrderStatus.DRAFT]);
  }

  confirm(): OrderEntity {
    if (this.items.length === 0) {
      throw new OrderDomainError('Order cannot be confirmed without items');
    }

    return this.transitionTo(OrderStatus.CONFIRMED, [OrderStatus.PENDING]);
  }

  complete(): OrderEntity {
    return this.transitionTo(OrderStatus.COMPLETED, [OrderStatus.CONFIRMED]);
  }

  cancel(): OrderEntity {
    return this.transitionTo(OrderStatus.CANCELLED, [
      OrderStatus.DRAFT,
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
    ]);
  }

  assertCanBeDeleted(): void {
    if (
      this.status === OrderStatus.CANCELLED ||
      this.status === OrderStatus.COMPLETED
    ) {
      throw new OrderDomainError(`Order with status ${this.status} cannot be deleted`);
    }
  }

  private transitionTo(nextStatus: OrderStatus, allowedCurrentStatuses: OrderStatus[]): OrderEntity {
    if (!allowedCurrentStatuses.includes(this.status)) {
      throw new OrderDomainError(
        `Cannot transition order from ${this.status} to ${nextStatus}`,
      );
    }

    return new OrderEntity(
      this.id,
      this.organizationId,
      this.customerId,
      nextStatus,
      this.total,
      this.items,
      this.createdAt,
      this.updatedAt,
    );
  }
}

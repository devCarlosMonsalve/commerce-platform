import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderEntity } from './order.entity';

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

export interface IOrderRepository {
  findById(id: string): Promise<OrderEntity | null>;
  findAllByOrganization(organizationId: string): Promise<OrderEntity[]>;
  create(data: {
    organizationId: string;
    customerId?: string;
    items: { productId: string; quantity: number; unitPrice: Decimal }[];
  }): Promise<OrderEntity>;
  updateStatus(id: string, status: OrderStatus): Promise<OrderEntity>;
  delete(id: string): Promise<void>;
}

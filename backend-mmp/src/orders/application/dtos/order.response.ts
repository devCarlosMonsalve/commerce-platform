import { OrderStatus } from '@prisma/client';
import { OrderEntity } from '../../domain/order.entity';

export class OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  productDescription: string | null;
  quantity: number;
  unitPrice: string;
  total: string;
}

export class OrderResponse {
  id: string;
  organizationId: string;
  customerId: string;
  status: OrderStatus;
  total: string;
  items: OrderItemResponse[];
  createdAt: Date;
  updatedAt: Date;

  static from(entity: OrderEntity): OrderResponse {
    const dto = new OrderResponse();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.customerId = entity.customerId;
    dto.status = entity.status;
    dto.total = entity.total.toString();
    dto.items = entity.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      productDescription: item.productDescription,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      total: item.total.toString(),
    }));
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

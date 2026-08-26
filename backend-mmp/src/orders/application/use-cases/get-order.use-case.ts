import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrderEntity } from '../../domain/order.entity';
import { ORDER_REPOSITORY } from '../../domain/order.repository';
import type { IOrderRepository } from '../../domain/order.repository';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(organizationId: string, orderId: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(orderId);
    if (!order || order.organizationId !== organizationId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}

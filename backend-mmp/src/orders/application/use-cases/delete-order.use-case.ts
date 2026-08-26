import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ORDER_REPOSITORY } from '../../domain/order.repository';
import type { IOrderRepository } from '../../domain/order.repository';

@Injectable()
export class DeleteOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(organizationId: string, orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order || order.organizationId !== organizationId) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepository.delete(orderId);
  }
}

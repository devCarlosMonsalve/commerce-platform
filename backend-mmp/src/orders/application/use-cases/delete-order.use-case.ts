import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ORDER_REPOSITORY } from '../../domain/order.repository';
import { OrderDomainError } from '../../domain/order-domain.error';
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

    try {
      order.assertCanBeDeleted();
    } catch (error) {
      if (error instanceof OrderDomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }

    await this.orderRepository.delete(orderId);
  }
}

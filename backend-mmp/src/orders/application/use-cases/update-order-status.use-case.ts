import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrderEntity } from '../../domain/order.entity';
import { ORDER_REPOSITORY } from '../../domain/order.repository';
import type { IOrderRepository } from '../../domain/order.repository';
import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    organizationId: string,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(orderId);
    if (!order || order.organizationId !== organizationId) {
      throw new NotFoundException('Order not found');
    }

    return this.orderRepository.updateStatus(orderId, dto.status);
  }
}

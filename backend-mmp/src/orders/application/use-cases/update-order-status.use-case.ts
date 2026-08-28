import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrderEntity } from '../../domain/order.entity';
import { OrderDomainError } from '../../domain/order-domain.error';
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

    try {
      const updatedOrder = this.applyStatusTransition(order, dto.status);
      return await this.orderRepository.updateStatus(updatedOrder, order.status);
    } catch (error) {
      if (error instanceof OrderDomainError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  private applyStatusTransition(order: OrderEntity, status: OrderStatus): OrderEntity {
    switch (status) {
      case OrderStatus.PENDING:
        return order.submit();
      case OrderStatus.CONFIRMED:
        return order.confirm();
      case OrderStatus.COMPLETED:
        return order.complete();
      case OrderStatus.CANCELLED:
        return order.cancel();
      default:
        throw new OrderDomainError(`Cannot transition order from ${order.status} to ${status}`);
    }
  }
}

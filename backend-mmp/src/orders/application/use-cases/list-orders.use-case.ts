import { Inject, Injectable } from '@nestjs/common';
import { OrderEntity } from '../../domain/order.entity';
import { ORDER_REPOSITORY } from '../../domain/order.repository';
import type { IOrderRepository } from '../../domain/order.repository';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  execute(organizationId: string): Promise<OrderEntity[]> {
    return this.orderRepository.findAllByOrganization(organizationId);
  }
}

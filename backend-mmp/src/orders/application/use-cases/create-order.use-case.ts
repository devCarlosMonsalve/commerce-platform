import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderEntity } from '../../domain/order.entity';
import { ORDER_REPOSITORY } from '../../domain/order.repository';
import type { IOrderRepository } from '../../domain/order.repository';
import { CreateOrderDto } from '../dtos/create-order.dto';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(organizationId: string, dto: CreateOrderDto): Promise<OrderEntity> {
    if (dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    return this.orderRepository.create({
      organizationId,
      customerId: dto.customerId,
      items: dto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: new Decimal(item.unitPrice),
      })),
    });
  }
}

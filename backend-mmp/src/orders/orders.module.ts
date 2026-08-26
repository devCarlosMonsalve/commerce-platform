import { Module } from '@nestjs/common';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { DeleteOrderUseCase } from './application/use-cases/delete-order.use-case';
import { GetOrderUseCase } from './application/use-cases/get-order.use-case';
import { ListOrdersUseCase } from './application/use-cases/list-orders.use-case';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import { ORDER_REPOSITORY } from './domain/order.repository';
import { OrdersController } from './infrastructure/orders.controller';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';
import { OrganizationMemberGuard } from '../shared/guards/organization-member.guard';
import { RolesGuard } from '../shared/guards/roles.guard';

@Module({
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderUseCase,
    UpdateOrderStatusUseCase,
    DeleteOrderUseCase,
    OrganizationMemberGuard,
    RolesGuard,
    { provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository },
  ],
})
export class OrdersModule {}

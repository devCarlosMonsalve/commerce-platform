import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateOrderDto } from '../application/dtos/create-order.dto';
import { UpdateOrderStatusDto } from '../application/dtos/update-order-status.dto';
import { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';
import { DeleteOrderUseCase } from '../application/use-cases/delete-order.use-case';
import { GetOrderUseCase } from '../application/use-cases/get-order.use-case';
import { ListOrdersUseCase } from '../application/use-cases/list-orders.use-case';
import { UpdateOrderStatusUseCase } from '../application/use-cases/update-order-status.use-case';

@Controller('organizations/:orgId/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
  ) {}

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateOrderDto) {
    return this.createOrderUseCase.execute(orgId, dto);
  }

  @Get()
  list(@Param('orgId') orgId: string) {
    return this.listOrdersUseCase.execute(orgId);
  }

  @Get(':orderId')
  get(@Param('orgId') orgId: string, @Param('orderId') orderId: string) {
    return this.getOrderUseCase.execute(orgId, orderId);
  }

  @Patch(':orderId/status')
  updateStatus(
    @Param('orgId') orgId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.updateOrderStatusUseCase.execute(orgId, orderId, dto);
  }

  @Delete(':orderId')
  remove(@Param('orgId') orgId: string, @Param('orderId') orderId: string) {
    return this.deleteOrderUseCase.execute(orgId, orderId);
  }
}

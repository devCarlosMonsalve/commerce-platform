import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { OrganizationMemberGuard } from '../../shared/guards/organization-member.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { ok } from '../../shared/response/api-response';
import { CreateOrderDto } from '../application/dtos/create-order.dto';
import { OrderResponse } from '../application/dtos/order.response';
import { UpdateOrderStatusDto } from '../application/dtos/update-order-status.dto';
import { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';
import { DeleteOrderUseCase } from '../application/use-cases/delete-order.use-case';
import { GetOrderUseCase } from '../application/use-cases/get-order.use-case';
import { ListOrdersUseCase } from '../application/use-cases/list-orders.use-case';
import { UpdateOrderStatusUseCase } from '../application/use-cases/update-order-status.use-case';

@Controller('organizations/:orgId/orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async create(@Param('orgId') orgId: string, @Body() dto: CreateOrderDto) {
    const order = await this.createOrderUseCase.execute(orgId, dto);
    return ok(OrderResponse.from(order), 'Order created successfully');
  }

  @Get()
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async list(@Param('orgId') orgId: string) {
    const orders = await this.listOrdersUseCase.execute(orgId);
    return ok(orders.map((order) => OrderResponse.from(order)));
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async get(@Param('orgId') orgId: string, @Param('orderId') orderId: string) {
    const order = await this.getOrderUseCase.execute(orgId, orderId);
    return ok(OrderResponse.from(order));
  }

  @Patch(':orderId/status')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  updateStatus(
    @Param('orgId') orgId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.updateOrderStatusUseCase.execute(orgId, orderId, dto).then((order) => {
      return ok(OrderResponse.from(order), 'Order updated successfully');
    });
  }

  @Delete(':orderId')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async remove(@Param('orgId') orgId: string, @Param('orderId') orderId: string) {
    await this.deleteOrderUseCase.execute(orgId, orderId);
    return ok(null, 'Deleted successfully');
  }
}


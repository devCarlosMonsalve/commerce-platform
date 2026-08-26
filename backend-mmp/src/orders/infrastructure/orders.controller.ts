import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { OrganizationMemberGuard } from '../../shared/guards/organization-member.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CreateOrderDto } from '../application/dtos/create-order.dto';
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
  create(@Param('orgId') orgId: string, @Body() dto: CreateOrderDto) {
    return this.createOrderUseCase.execute(orgId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  list(@Param('orgId') orgId: string) {
    return this.listOrdersUseCase.execute(orgId);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  get(@Param('orgId') orgId: string, @Param('orderId') orderId: string) {
    return this.getOrderUseCase.execute(orgId, orderId);
  }

  @Patch(':orderId/status')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  updateStatus(
    @Param('orgId') orgId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.updateOrderStatusUseCase.execute(orgId, orderId, dto);
  }

  @Delete(':orderId')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  remove(@Param('orgId') orgId: string, @Param('orderId') orderId: string) {
    return this.deleteOrderUseCase.execute(orgId, orderId);
  }
}

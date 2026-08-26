import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders for a tenant' })
  @ApiQuery({ name: 'tenantId', required: true })
  findAll(@Query('tenantId') tenantId: string) {
    return this.ordersService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiQuery({ name: 'tenantId', required: true })
  findOne(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.ordersService.findById(tenantId, id);
  }
}

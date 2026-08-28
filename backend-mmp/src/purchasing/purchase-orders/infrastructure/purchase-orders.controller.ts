import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { OrganizationMemberGuard } from '../../../shared/guards/organization-member.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ok } from '../../../shared/response/api-response';
import { CreatePurchaseOrderDto } from '../application/dtos/create-purchase-order.dto';
import { PurchaseOrderResponse } from '../application/dtos/purchase-order.response';
import { ReceivePurchaseOrderDto } from '../application/dtos/receive-purchase-order.dto';
import { UpdatePurchaseOrderStatusDto } from '../application/dtos/update-purchase-order-status.dto';
import { CreatePurchaseOrderUseCase } from '../application/use-cases/create-purchase-order.use-case';
import { DeletePurchaseOrderUseCase } from '../application/use-cases/delete-purchase-order.use-case';
import { GetPurchaseOrderUseCase } from '../application/use-cases/get-purchase-order.use-case';
import { ListPurchaseOrdersUseCase } from '../application/use-cases/list-purchase-orders.use-case';
import { ReceivePurchaseOrderUseCase } from '../application/use-cases/receive-purchase-order.use-case';
import { UpdatePurchaseOrderStatusUseCase } from '../application/use-cases/update-purchase-order-status.use-case';

@Controller('organizations/:orgId/purchase-orders')
export class PurchaseOrdersController {
  constructor(
    private readonly createPurchaseOrderUseCase: CreatePurchaseOrderUseCase,
    private readonly listPurchaseOrdersUseCase: ListPurchaseOrdersUseCase,
    private readonly getPurchaseOrderUseCase: GetPurchaseOrderUseCase,
    private readonly updatePurchaseOrderStatusUseCase: UpdatePurchaseOrderStatusUseCase,
    private readonly receivePurchaseOrderUseCase: ReceivePurchaseOrderUseCase,
    private readonly deletePurchaseOrderUseCase: DeletePurchaseOrderUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async create(
    @Param('orgId') orgId: string,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    const purchaseOrder = await this.createPurchaseOrderUseCase.execute(
      orgId,
      dto,
    );
    return ok(
      PurchaseOrderResponse.from(purchaseOrder),
      'Purchase order created successfully',
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async list(@Param('orgId') orgId: string) {
    const purchaseOrders = await this.listPurchaseOrdersUseCase.execute(orgId);
    return ok(
      purchaseOrders.map((purchaseOrder) =>
        PurchaseOrderResponse.from(purchaseOrder),
      ),
    );
  }

  @Get(':purchaseOrderId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async get(
    @Param('orgId') orgId: string,
    @Param('purchaseOrderId') purchaseOrderId: string,
  ) {
    const purchaseOrder = await this.getPurchaseOrderUseCase.execute(
      orgId,
      purchaseOrderId,
    );
    return ok(PurchaseOrderResponse.from(purchaseOrder));
  }

  @Patch(':purchaseOrderId/status')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async updateStatus(
    @Param('orgId') orgId: string,
    @Param('purchaseOrderId') purchaseOrderId: string,
    @Body() dto: UpdatePurchaseOrderStatusDto,
  ) {
    const purchaseOrder = await this.updatePurchaseOrderStatusUseCase.execute(
      orgId,
      purchaseOrderId,
      dto,
    );
    return ok(
      PurchaseOrderResponse.from(purchaseOrder),
      'Purchase order updated successfully',
    );
  }

  @Post(':purchaseOrderId/receipts')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async receive(
    @Param('orgId') orgId: string,
    @Param('purchaseOrderId') purchaseOrderId: string,
    @Body() dto: ReceivePurchaseOrderDto,
  ) {
    const purchaseOrder = await this.receivePurchaseOrderUseCase.execute(
      orgId,
      purchaseOrderId,
      dto,
    );
    return ok(
      PurchaseOrderResponse.from(purchaseOrder),
      'Purchase order received successfully',
    );
  }

  @Delete(':purchaseOrderId')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async remove(
    @Param('orgId') orgId: string,
    @Param('purchaseOrderId') purchaseOrderId: string,
  ) {
    await this.deletePurchaseOrderUseCase.execute(orgId, purchaseOrderId);
    return ok(null, 'Deleted successfully');
  }
}

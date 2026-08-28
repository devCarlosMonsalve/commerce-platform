import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../products/domain/product.repository';
import { PrismaProductRepository } from '../products/infrastructure/persistence/prisma-product.repository';
import { OrganizationMemberGuard } from '../shared/guards/organization-member.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { CreatePurchaseOrderUseCase } from './purchase-orders/application/use-cases/create-purchase-order.use-case';
import { DeletePurchaseOrderUseCase } from './purchase-orders/application/use-cases/delete-purchase-order.use-case';
import { GetPurchaseOrderUseCase } from './purchase-orders/application/use-cases/get-purchase-order.use-case';
import { ListPurchaseOrdersUseCase } from './purchase-orders/application/use-cases/list-purchase-orders.use-case';
import { ReceivePurchaseOrderUseCase } from './purchase-orders/application/use-cases/receive-purchase-order.use-case';
import { UpdatePurchaseOrderStatusUseCase } from './purchase-orders/application/use-cases/update-purchase-order-status.use-case';
import { PURCHASE_ORDER_REPOSITORY } from './purchase-orders/domain/purchase-order.repository';
import { PurchaseOrdersController } from './purchase-orders/infrastructure/purchase-orders.controller';
import { PrismaPurchaseOrderRepository } from './purchase-orders/infrastructure/persistence/prisma-purchase-order.repository';
import { CreateSupplierUseCase } from './suppliers/application/use-cases/create-supplier.use-case';
import { DeleteSupplierUseCase } from './suppliers/application/use-cases/delete-supplier.use-case';
import { GetSupplierUseCase } from './suppliers/application/use-cases/get-supplier.use-case';
import { ListSuppliersUseCase } from './suppliers/application/use-cases/list-suppliers.use-case';
import { UpdateSupplierUseCase } from './suppliers/application/use-cases/update-supplier.use-case';
import { SUPPLIER_REPOSITORY } from './suppliers/domain/supplier.repository';
import { SuppliersController } from './suppliers/infrastructure/suppliers.controller';
import { PrismaSupplierRepository } from './suppliers/infrastructure/persistence/prisma-supplier.repository';

@Module({
  controllers: [SuppliersController, PurchaseOrdersController],
  providers: [
    CreateSupplierUseCase,
    ListSuppliersUseCase,
    GetSupplierUseCase,
    UpdateSupplierUseCase,
    DeleteSupplierUseCase,
    CreatePurchaseOrderUseCase,
    ListPurchaseOrdersUseCase,
    GetPurchaseOrderUseCase,
    UpdatePurchaseOrderStatusUseCase,
    ReceivePurchaseOrderUseCase,
    DeletePurchaseOrderUseCase,
    OrganizationMemberGuard,
    RolesGuard,
    { provide: SUPPLIER_REPOSITORY, useClass: PrismaSupplierRepository },
    {
      provide: PURCHASE_ORDER_REPOSITORY,
      useClass: PrismaPurchaseOrderRepository,
    },
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
  ],
})
export class PurchasingModule {}

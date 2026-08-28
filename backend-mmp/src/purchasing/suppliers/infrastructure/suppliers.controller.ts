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
import { CreateSupplierDto } from '../application/dtos/create-supplier.dto';
import { SupplierResponse } from '../application/dtos/supplier.response';
import { UpdateSupplierDto } from '../application/dtos/update-supplier.dto';
import { CreateSupplierUseCase } from '../application/use-cases/create-supplier.use-case';
import { DeleteSupplierUseCase } from '../application/use-cases/delete-supplier.use-case';
import { GetSupplierUseCase } from '../application/use-cases/get-supplier.use-case';
import { ListSuppliersUseCase } from '../application/use-cases/list-suppliers.use-case';
import { UpdateSupplierUseCase } from '../application/use-cases/update-supplier.use-case';

@Controller('organizations/:orgId/suppliers')
export class SuppliersController {
  constructor(
    private readonly createSupplierUseCase: CreateSupplierUseCase,
    private readonly listSuppliersUseCase: ListSuppliersUseCase,
    private readonly getSupplierUseCase: GetSupplierUseCase,
    private readonly updateSupplierUseCase: UpdateSupplierUseCase,
    private readonly deleteSupplierUseCase: DeleteSupplierUseCase,
  ) {}

  @Post()
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async create(@Param('orgId') orgId: string, @Body() dto: CreateSupplierDto) {
    const supplier = await this.createSupplierUseCase.execute(orgId, dto);
    return ok(SupplierResponse.from(supplier), 'Supplier created successfully');
  }

  @Get()
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async list(@Param('orgId') orgId: string) {
    const suppliers = await this.listSuppliersUseCase.execute(orgId);
    return ok(suppliers.map((supplier) => SupplierResponse.from(supplier)));
  }

  @Get(':supplierId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async get(
    @Param('orgId') orgId: string,
    @Param('supplierId') supplierId: string,
  ) {
    const supplier = await this.getSupplierUseCase.execute(orgId, supplierId);
    return ok(SupplierResponse.from(supplier));
  }

  @Patch(':supplierId')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async update(
    @Param('orgId') orgId: string,
    @Param('supplierId') supplierId: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    const supplier = await this.updateSupplierUseCase.execute(
      orgId,
      supplierId,
      dto,
    );
    return ok(SupplierResponse.from(supplier), 'Supplier updated successfully');
  }

  @Delete(':supplierId')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  async remove(
    @Param('orgId') orgId: string,
    @Param('supplierId') supplierId: string,
  ) {
    await this.deleteSupplierUseCase.execute(orgId, supplierId);
    return ok(null, 'Deleted successfully');
  }
}

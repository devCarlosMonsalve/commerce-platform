import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { OrganizationMemberGuard } from '../../shared/guards/organization-member.guard';
import { CreateCustomerDto } from '../application/dtos/create-customer.dto';
import { UpdateCustomerDto } from '../application/dtos/update-customer.dto';
import { CreateCustomerUseCase } from '../application/use-cases/create-customer.use-case';
import { DeleteCustomerUseCase } from '../application/use-cases/delete-customer.use-case';
import { GetCustomerUseCase } from '../application/use-cases/get-customer.use-case';
import { ListCustomersUseCase } from '../application/use-cases/list-customers.use-case';
import { UpdateCustomerUseCase } from '../application/use-cases/update-customer.use-case';

@Controller('organizations/:orgId/customers')
export class CustomersController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly getCustomerUseCase: GetCustomerUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  create(@Param('orgId') orgId: string, @Body() dto: CreateCustomerDto) {
    return this.createCustomerUseCase.execute(orgId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  list(@Param('orgId') orgId: string) {
    return this.listCustomersUseCase.execute(orgId);
  }

  @Get(':customerId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  get(@Param('orgId') orgId: string, @Param('customerId') customerId: string) {
    return this.getCustomerUseCase.execute(orgId, customerId);
  }

  @Patch(':customerId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  update(
    @Param('orgId') orgId: string,
    @Param('customerId') customerId: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.updateCustomerUseCase.execute(orgId, customerId, dto);
  }

  @Delete(':customerId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  remove(@Param('orgId') orgId: string, @Param('customerId') customerId: string) {
    return this.deleteCustomerUseCase.execute(orgId, customerId);
  }
}

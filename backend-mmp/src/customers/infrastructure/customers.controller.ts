import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { OrganizationMemberGuard } from '../../shared/guards/organization-member.guard';
import { ok } from '../../shared/response/api-response';
import { CustomerResponse } from '../application/dtos/customer.response';
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
  async create(@Param('orgId') orgId: string, @Body() dto: CreateCustomerDto) {
    const customer = await this.createCustomerUseCase.execute(orgId, dto);
    return ok(
      CustomerResponse.from(customer),
      'Customer created successfully',
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async list(@Param('orgId') orgId: string) {
    const customers = await this.listCustomersUseCase.execute(orgId);
    return ok(customers.map((customer) => CustomerResponse.from(customer)));
  }

  @Get(':customerId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async get(@Param('orgId') orgId: string, @Param('customerId') customerId: string) {
    const customer = await this.getCustomerUseCase.execute(orgId, customerId);
    return ok(CustomerResponse.from(customer));
  }

  @Patch(':customerId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  update(
    @Param('orgId') orgId: string,
    @Param('customerId') customerId: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.updateCustomerUseCase
      .execute(orgId, customerId, dto)
      .then((customer) =>
        ok(CustomerResponse.from(customer), 'Customer updated successfully'),
      );
  }

  @Delete(':customerId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  async remove(@Param('orgId') orgId: string, @Param('customerId') customerId: string) {
    await this.deleteCustomerUseCase.execute(orgId, customerId);
    return ok(null, 'Deleted successfully');
  }
}


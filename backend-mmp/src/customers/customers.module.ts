import { Module } from '@nestjs/common';
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';
import { DeleteCustomerUseCase } from './application/use-cases/delete-customer.use-case';
import { GetCustomerUseCase } from './application/use-cases/get-customer.use-case';
import { ListCustomersUseCase } from './application/use-cases/list-customers.use-case';
import { UpdateCustomerUseCase } from './application/use-cases/update-customer.use-case';
import { CUSTOMER_REPOSITORY } from './domain/customer.repository';
import { CustomersController } from './infrastructure/customers.controller';
import { PrismaCustomerRepository } from './infrastructure/persistence/prisma-customer.repository';
import { OrganizationMemberGuard } from '../shared/guards/organization-member.guard';

@Module({
  controllers: [CustomersController],
  providers: [
    CreateCustomerUseCase,
    ListCustomersUseCase,
    GetCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    OrganizationMemberGuard,
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
  ],
})
export class CustomersModule {}

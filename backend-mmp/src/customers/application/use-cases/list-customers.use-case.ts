import { Inject, Injectable } from '@nestjs/common';
import { CustomerEntity } from '../../domain/customer.entity';
import { CUSTOMER_REPOSITORY } from '../../domain/customer.repository';
import type { ICustomerRepository } from '../../domain/customer.repository';

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  execute(organizationId: string): Promise<CustomerEntity[]> {
    return this.customerRepository.findAllByOrganization(organizationId);
  }
}

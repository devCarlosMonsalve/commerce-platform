import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from '../../domain/customer.repository';
import type { ICustomerRepository } from '../../domain/customer.repository';

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(organizationId: string, customerId: string): Promise<void> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer || customer.organizationId !== organizationId) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.delete(customerId);
  }
}

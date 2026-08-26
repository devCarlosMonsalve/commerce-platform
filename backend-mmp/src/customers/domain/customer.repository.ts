import { CustomerEntity } from './customer.entity';

export const CUSTOMER_REPOSITORY = 'CUSTOMER_REPOSITORY';

export interface ICustomerRepository {
  findById(id: string): Promise<CustomerEntity | null>;
  findAllByOrganization(organizationId: string): Promise<CustomerEntity[]>;
  create(data: {
    organizationId: string;
    name: string;
    email?: string;
    phone?: string;
  }): Promise<CustomerEntity>;
  update(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<CustomerEntity>;
  delete(id: string): Promise<void>;
}

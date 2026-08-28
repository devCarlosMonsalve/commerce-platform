import { SupplierEntity } from './supplier.entity';

export const SUPPLIER_REPOSITORY = 'SUPPLIER_REPOSITORY';

export interface ISupplierRepository {
  findById(id: string): Promise<SupplierEntity | null>;
  findAllByOrganization(organizationId: string): Promise<SupplierEntity[]>;
  create(data: {
    organizationId: string;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    taxId?: string;
    address?: string;
  }): Promise<SupplierEntity>;
  update(
    id: string,
    data: {
      name?: string;
      contactName?: string;
      email?: string;
      phone?: string;
      taxId?: string;
      address?: string;
    },
  ): Promise<SupplierEntity>;
  delete(id: string): Promise<void>;
}

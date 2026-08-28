export class SupplierEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly name: string,
    public readonly contactName: string | null,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly taxId: string | null,
    public readonly address: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

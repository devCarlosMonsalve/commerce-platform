export class CustomerEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly name: string,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

import { MembershipRole } from '@prisma/client';

export class MembershipEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly organizationId: string,
    public readonly role: MembershipRole,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

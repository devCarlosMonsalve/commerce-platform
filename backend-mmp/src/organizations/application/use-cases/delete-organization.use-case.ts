import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { ORGANIZATION_REPOSITORY } from '../../domain/organization.repository';
import type { IOrganizationRepository } from '../../domain/organization.repository';

@Injectable()
export class DeleteOrganizationUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(userId: string, organizationId: string): Promise<void> {
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const membership = await this.organizationRepository.findMembership(
      userId,
      organizationId,
    );
    if (!membership) {
      throw new ForbiddenException('Access denied');
    }

    if (membership.role !== MembershipRole.OWNER) {
      throw new ForbiddenException('Only owners can delete organizations');
    }

    await this.organizationRepository.delete(organizationId);
  }
}

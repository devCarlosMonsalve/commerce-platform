import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationEntity } from '../../domain/organization.entity';
import { ORGANIZATION_REPOSITORY } from '../../domain/organization.repository';
import type { IOrganizationRepository } from '../../domain/organization.repository';

@Injectable()
export class GetOrganizationUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationEntity> {
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

    return organization;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../../domain/organization.entity';
import { ORGANIZATION_REPOSITORY } from '../../domain/organization.repository';
import type { IOrganizationRepository } from '../../domain/organization.repository';

@Injectable()
export class ListOrganizationsUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  execute(userId: string): Promise<OrganizationEntity[]> {
    return this.organizationRepository.findAllByUserId(userId);
  }
}

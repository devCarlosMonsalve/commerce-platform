import { OrganizationEntity } from '../../domain/organization.entity';

export class OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;

  static from(entity: OrganizationEntity): OrganizationResponse {
    const dto = new OrganizationResponse();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.slug = entity.slug;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

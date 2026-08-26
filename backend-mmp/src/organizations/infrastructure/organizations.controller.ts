import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { OrganizationMemberGuard } from '../../shared/guards/organization-member.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CreateOrganizationDto } from '../application/dtos/create-organization.dto';
import { UpdateOrganizationDto } from '../application/dtos/update-organization.dto';
import { CreateOrganizationUseCase } from '../application/use-cases/create-organization.use-case';
import { DeleteOrganizationUseCase } from '../application/use-cases/delete-organization.use-case';
import { GetOrganizationUseCase } from '../application/use-cases/get-organization.use-case';
import { ListOrganizationsUseCase } from '../application/use-cases/list-organizations.use-case';
import { UpdateOrganizationUseCase } from '../application/use-cases/update-organization.use-case';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly listOrganizationsUseCase: ListOrganizationsUseCase,
    private readonly getOrganizationUseCase: GetOrganizationUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly deleteOrganizationUseCase: DeleteOrganizationUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: { sub: string; email: string },
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.createOrganizationUseCase.execute(user.sub, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: { sub: string; email: string }) {
    return this.listOrganizationsUseCase.execute(user.sub);
  }

  @Get(':orgId')
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard)
  get(
    @CurrentUser() user: { sub: string; email: string },
    @Param('orgId') orgId: string,
  ) {
    return this.getOrganizationUseCase.execute(user.sub, orgId);
  }

  @Patch(':orgId')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  update(
    @CurrentUser() user: { sub: string; email: string },
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.updateOrganizationUseCase.execute(user.sub, orgId, dto);
  }

  @Delete(':orgId')
  @Roles(MembershipRole.OWNER)
  @UseGuards(JwtAuthGuard, OrganizationMemberGuard, RolesGuard)
  remove(
    @CurrentUser() user: { sub: string; email: string },
    @Param('orgId') orgId: string,
  ) {
    return this.deleteOrganizationUseCase.execute(user.sub, orgId);
  }
}

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
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateOrganizationDto } from '../application/dtos/create-organization.dto';
import { UpdateOrganizationDto } from '../application/dtos/update-organization.dto';
import { CreateOrganizationUseCase } from '../application/use-cases/create-organization.use-case';
import { DeleteOrganizationUseCase } from '../application/use-cases/delete-organization.use-case';
import { GetOrganizationUseCase } from '../application/use-cases/get-organization.use-case';
import { ListOrganizationsUseCase } from '../application/use-cases/list-organizations.use-case';
import { UpdateOrganizationUseCase } from '../application/use-cases/update-organization.use-case';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly listOrganizationsUseCase: ListOrganizationsUseCase,
    private readonly getOrganizationUseCase: GetOrganizationUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly deleteOrganizationUseCase: DeleteOrganizationUseCase,
  ) {}

  @Post()
  create(
    @CurrentUser() user: { sub: string; email: string },
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.createOrganizationUseCase.execute(user.sub, dto);
  }

  @Get()
  list(@CurrentUser() user: { sub: string; email: string }) {
    return this.listOrganizationsUseCase.execute(user.sub);
  }

  @Get(':orgId')
  get(
    @CurrentUser() user: { sub: string; email: string },
    @Param('orgId') orgId: string,
  ) {
    return this.getOrganizationUseCase.execute(user.sub, orgId);
  }

  @Patch(':orgId')
  update(
    @CurrentUser() user: { sub: string; email: string },
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.updateOrganizationUseCase.execute(user.sub, orgId, dto);
  }

  @Delete(':orgId')
  remove(
    @CurrentUser() user: { sub: string; email: string },
    @Param('orgId') orgId: string,
  ) {
    return this.deleteOrganizationUseCase.execute(user.sub, orgId);
  }
}

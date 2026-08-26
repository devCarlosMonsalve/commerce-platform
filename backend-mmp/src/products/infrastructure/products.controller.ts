import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateProductDto } from '../application/dtos/create-product.dto';
import { UpdateProductDto } from '../application/dtos/update-product.dto';
import { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from '../application/use-cases/delete-product.use-case';
import { GetProductUseCase } from '../application/use-cases/get-product.use-case';
import { ListProductsUseCase } from '../application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from '../application/use-cases/update-product.use-case';

@Controller('organizations/:orgId/products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute(orgId, dto);
  }

  @Get()
  list(@Param('orgId') orgId: string) {
    return this.listProductsUseCase.execute(orgId);
  }

  @Get(':productId')
  get(@Param('orgId') orgId: string, @Param('productId') productId: string) {
    return this.getProductUseCase.execute(orgId, productId);
  }

  @Patch(':productId')
  update(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.updateProductUseCase.execute(orgId, productId, dto);
  }

  @Delete(':productId')
  remove(@Param('orgId') orgId: string, @Param('productId') productId: string) {
    return this.deleteProductUseCase.execute(orgId, productId);
  }
}

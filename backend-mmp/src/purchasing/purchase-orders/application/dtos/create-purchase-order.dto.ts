import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PurchaseOrderLineDto {
  @IsString()
  productId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineDto)
  items: PurchaseOrderLineDto[];
}

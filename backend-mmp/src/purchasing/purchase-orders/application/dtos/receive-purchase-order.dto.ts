import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReceivePurchaseOrderItemDto {
  @IsString()
  purchaseOrderItemId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ReceivePurchaseOrderDto {
  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReceivePurchaseOrderItemDto)
  items: ReceivePurchaseOrderItemDto[];
}

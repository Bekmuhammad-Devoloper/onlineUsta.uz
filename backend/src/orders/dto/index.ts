import { IsString, IsOptional, IsNumber, IsDateString, IsArray, IsInt, Min, Max, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Kategoriya ID (ixtiyoriy - erkin buyurtma uchun)' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Muammo tavsifi' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Xizmat manzili' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Bog\'lanish uchun qo\'shimcha telefon raqami', example: '+998901234567' })
  @IsString()
  contactPhone: string;

  @ApiPropertyOptional({ description: 'Viloyat/shahar nomi (masalan: Andijon, Toshkent)' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Qulay sana' })
  @IsDateString()
  @IsOptional()
  preferredDate?: Date;

  @ApiPropertyOptional({ description: 'Qulay soat' })
  @IsString()
  @IsOptional()
  preferredTime?: string;

  @ApiPropertyOptional({ description: 'Rasmlar URL ro\'yxati (max 5)', type: [String] })
  @IsArray()
  @IsOptional()
  images?: string[];
}

export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;
}

export class AcceptOrderDto {
  @ApiProperty()
  @IsString()
  orderId: string;
}

export class SendContractDto {
  @ApiProperty({ description: 'Ish narxi (so\'m)' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Ish tavsifi' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ChoosePaymentDto {
  @ApiProperty({ enum: ['PAYME', 'CLICK', 'CASH'], description: 'To\'lov turi' })
  @IsString()
  paymentType: string;
}

export class ReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5, description: 'Baho (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Izoh' })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class CancelOrderDto {
  @ApiPropertyOptional({ description: 'Bekor qilish sababi' })
  @IsString()
  @IsOptional()
  reason?: string;
}

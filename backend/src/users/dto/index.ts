import { IsString, IsOptional, IsNumber, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionType } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alisher Karimov' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Toshkent, Yunusobod tumani' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatar?: string;
}

export class BecomeMasterDto {
  @ApiProperty({ description: 'Kategoriya ID' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ description: 'O\'zi haqida qisqacha' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'Xizmat turlari', type: [String] })
  @IsArray()
  @IsOptional()
  services?: string[];

  @ApiProperty({ description: 'Pasport seriyasi', example: 'AA' })
  @IsString()
  passportSeries: string;

  @ApiProperty({ description: 'Pasport raqami', example: '1234567' })
  @IsString()
  passportNumber: string;

  @ApiProperty({ description: 'JSHIR', example: '12345678901234' })
  @IsString()
  passportJSHIR: string;

  @ApiPropertyOptional({ description: 'Pasport old taraf rasmi URL' })
  @IsString()
  @IsOptional()
  passportPhoto?: string;

  @ApiPropertyOptional({ description: 'Pasport orqa taraf rasmi URL' })
  @IsString()
  @IsOptional()
  passportPhotoBack?: string;

  @ApiProperty({ description: 'Bank karta raqami', example: '8600123456789012' })
  @IsString()
  bankCardNumber: string;

  @ApiProperty({ description: 'Karta egasining ismi', example: 'ALISHER KARIMOV' })
  @IsString()
  bankCardHolder: string;

  @ApiPropertyOptional({ description: 'Obuna turi: WEEKLY, MONTHLY, COMMISSION', enum: SubscriptionType })
  @IsEnum(SubscriptionType)
  @IsOptional()
  subscriptionType?: SubscriptionType;
}

export class CreateComplaintDto {
  @ApiProperty({ description: 'Shikoyat qilinayotgan foydalanuvchi ID' })
  @IsString()
  againstUserId: string;

  @ApiPropertyOptional({ description: 'Buyurtma ID' })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({ description: 'Shikoyat matni' })
  @IsString()
  description: string;
}

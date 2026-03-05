import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterMasterDto {
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

  @ApiProperty({ description: 'Pasport seriyasi' })
  @IsString()
  passportSeries: string;

  @ApiProperty({ description: 'Pasport raqami' })
  @IsString()
  passportNumber: string;

  @ApiProperty({ description: 'JSHIR' })
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

  @ApiProperty({ description: 'Bank karta raqami' })
  @IsString()
  bankCardNumber: string;

  @ApiProperty({ description: 'Karta egasining ismi' })
  @IsString()
  bankCardHolder: string;
}

export class UpdateMasterProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  services?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankCardNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankCardHolder?: string;
}

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'COMMISSION'] })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Obuna narxi' })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Admin belgilagan tarif ID' })
  @IsString()
  @IsOptional()
  tariffId?: string;
}

export class GeoLocationDto {
  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  longitude: number;
}

export class ToggleOnlineDto {
  @ApiProperty({ description: 'Online/offline holati' })
  @IsBoolean()
  isOnline: boolean;
}

export class DeviceChangeRequestDto {
  @ApiProperty({ description: 'Yangi qurilma identifikatori' })
  @IsString()
  newDeviceId: string;
}

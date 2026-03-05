import { IsString, IsNotEmpty, Matches, IsOptional, IsNumber, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+998901234567', description: 'Telefon raqami +998XXXXXXXXX formatda' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, { message: 'Telefon raqami +998XXXXXXXXX formatda bo\'lishi kerak' })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123456', description: '6 xonali SMS kod' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'Qurilma identifikatori' })
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional({ description: 'Firebase Cloud Messaging token' })
  @IsString()
  @IsOptional()
  fcmToken?: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Alisher Karimov', description: 'To\'liq ismi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Toshkent, Yunusobod tumani', description: 'Joylashuv manzili' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 41.2995 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 69.2401 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: 1995, description: 'Tug\'ilgan yili' })
  @IsInt()
  @Min(1940)
  @Max(2015)
  @IsOptional()
  birthYear?: number;
}

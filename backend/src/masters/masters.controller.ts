import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MastersService } from './masters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  RegisterMasterDto,
  UpdateMasterProfileDto,
  UpdateSubscriptionDto,
  GeoLocationDto,
  ToggleOnlineDto,
  DeviceChangeRequestDto,
} from './dto';

@ApiTags('Masters')
@Controller('masters')
export class MastersController {
  constructor(private mastersService: MastersService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha tasdiqlangan ustalarni olish' })
  @ApiQuery({ name: 'categoryId', required: false })
  async findAll(@Query('categoryId') categoryId?: string) {
    return this.mastersService.findAll(categoryId);
  }

  @Get('tariffs')
  @ApiOperation({ summary: 'Mavjud tariflar ro\'yxati (ustalar uchun)' })
  async getAvailableTariffs() {
    return this.mastersService.getAvailableTariffs();
  }

  @Get('available-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mavjud buyurtmalarni olish (faqat usta kategoriyasi)' })
  @ApiQuery({ name: 'region', required: false })
  async getAvailableOrders(@Request() req, @Query('region') region?: string) {
    if (!req.user.isMaster) {
      throw new ForbiddenException('Faqat ustalar uchun');
    }
    return this.mastersService.getAvailableOrders(req.user.masterId, region);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Usta statistikasini olish' })
  async getStats(@Request() req) {
    if (!req.user.isMaster) {
      throw new ForbiddenException('Faqat ustalar uchun');
    }
    return this.mastersService.getMasterStats(req.user.masterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Usta kartasini olish' })
  async findOne(@Param('id') id: string) {
    return this.mastersService.findOne(id);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Usta sifatida ro\'yxatdan o\'tish' })
  async register(@Request() req, @Body() dto: RegisterMasterDto) {
    return this.mastersService.register(req.user.id, dto);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Usta profilini yangilash' })
  async updateProfile(@Request() req, @Body() dto: UpdateMasterProfileDto) {
    if (!req.user.isMaster) {
      throw new ForbiddenException('Faqat ustalar profilni yangilashi mumkin');
    }
    return this.mastersService.updateProfile(req.user.masterId, dto);
  }

  @Patch('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obuna turini o\'zgartirish' })
  async updateSubscription(@Request() req, @Body() dto: UpdateSubscriptionDto) {
    if (!req.user.isMaster) {
      throw new ForbiddenException('Faqat ustalar obunani yangilashi mumkin');
    }
    return this.mastersService.updateSubscription(
      req.user.masterId,
      dto.type || 'COMMISSION',
      dto.price || 0,
      dto.tariffId,
    );
  }

  @Patch('toggle-online')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Online/Offline holatni o\'zgartirish' })
  async toggleOnline(@Request() req, @Body() dto: ToggleOnlineDto) {
    if (!req.user.isMaster) {
      throw new ForbiddenException('Faqat ustalar uchun');
    }
    return this.mastersService.toggleOnline(req.user.masterId, dto.isOnline);
  }

  @Post('device-change')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Qurilma o\'zgartirish so\'rovi yuborish' })
  async requestDeviceChange(@Request() req, @Body() dto: DeviceChangeRequestDto) {
    if (!req.user.isMaster) {
      throw new ForbiddenException('Faqat ustalar uchun');
    }
    return this.mastersService.requestDeviceChange(req.user.masterId, dto.newDeviceId);
  }

  @Post('location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Usta geolokatsiyasini yuborish' })
  async logLocation(@Request() req, @Body() dto: GeoLocationDto) {
    if (!req.user.isMaster) {
      throw new ForbiddenException('Faqat ustalar uchun');
    }
    return this.mastersService.logGeoLocation(
      req.user.masterId,
      dto.latitude,
      dto.longitude,
    );
  }
}

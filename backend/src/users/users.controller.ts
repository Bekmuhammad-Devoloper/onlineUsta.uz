import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto, BecomeMasterDto, CreateComplaintDto } from './dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Joriy foydalanuvchi profilini olish' })
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Profilni yangilash' })
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.update(req.user.id, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Buyurtmalar tarixini olish' })
  async getOrders(@Request() req) {
    return this.usersService.getOrderHistory(req.user.id);
  }

  @Post('become-master')
  @ApiOperation({ summary: 'Usta bo\'lish uchun ariza berish' })
  async becomeMaster(@Request() req, @Body() dto: BecomeMasterDto) {
    return this.usersService.becomeMaster(req.user.id, dto);
  }

  @Post('complaints')
  @ApiOperation({ summary: 'Shikoyat yuborish' })
  async createComplaint(@Request() req, @Body() dto: CreateComplaintDto) {
    return this.usersService.createComplaint(req.user.id, dto);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Bildirishnomalarni olish' })
  async getNotifications(@Request() req) {
    return this.usersService.getNotifications(req.user.id);
  }
}

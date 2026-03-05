import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ==================== DASHBOARD ====================

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard statistikasi' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('revenue/monthly')
  @ApiOperation({ summary: 'Oylik daromad statistikasi' })
  @ApiQuery({ name: 'months', required: false })
  async getMonthlyRevenue(@Query('months') months?: string) {
    return this.adminService.getMonthlyRevenue(months ? parseInt(months) : 12);
  }

  // ==================== CATEGORIES ====================

  @Get('categories')
  @ApiOperation({ summary: 'Barcha kategoriyalar' })
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Yangi kategoriya qo\'shish' })
  async createCategory(@Body() dto: { name: string; nameUz: string; icon?: string; image?: string }) {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Kategoriyani tahrirlash' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: { name?: string; nameUz?: string; icon?: string; image?: string },
  ) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Kategoriyani o\'chirish' })
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // ==================== USERS ====================

  @Get('users')
  @ApiOperation({ summary: 'Foydalanuvchilar ro\'yxati' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getUsers({
      search,
      role,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Patch('users/:id/block')
  @ApiOperation({ summary: 'Foydalanuvchini bloklash' })
  async blockUser(@Param('id') id: string, @Body() dto?: { reason?: string }) {
    return this.adminService.blockUser(id, dto?.reason);
  }

  @Patch('users/:id/unblock')
  @ApiOperation({ summary: 'Foydalanuvchini blokdan chiqarish' })
  async unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(id);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Foydalanuvchi batafsil ma\'lumoti' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  // ==================== MASTERS ====================

  @Get('masters')
  @ApiOperation({ summary: 'Ustalar ro\'yxati (filtirli)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'isVerified', required: false })
  @ApiQuery({ name: 'isOnline', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMasters(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isVerified') isVerified?: string,
    @Query('isOnline') isOnline?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getMasters({
      search,
      categoryId,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
      isOnline: isOnline !== undefined ? isOnline === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Patch('masters/:id/verify')
  @ApiOperation({ summary: 'Ustani tasdiqlash' })
  async verifyMaster(@Param('id') id: string) {
    return this.adminService.verifyMaster(id);
  }

  @Patch('masters/:id/reject')
  @ApiOperation({ summary: 'Ustani rad etish' })
  async rejectMaster(@Param('id') id: string, @Body() dto: { reason: string }) {
    return this.adminService.rejectMaster(id, dto.reason);
  }

  @Get('masters/:id/detail')
  @ApiOperation({ summary: 'Usta batafsil ma\'lumoti' })
  async getMasterById(@Param('id') id: string) {
    return this.adminService.getMasterById(id);
  }

  // ==================== ORDERS ====================

  @Get('orders')
  @ApiOperation({ summary: 'Barcha buyurtmalar' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getOrders(
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getOrders({
      status,
      categoryId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Patch('orders/:id/assign')
  @ApiOperation({ summary: 'Buyurtmaga usta biriktirish' })
  async assignOrder(@Param('id') id: string, @Body() dto: { masterId: string }) {
    return this.adminService.assignOrderToMaster(id, dto.masterId);
  }

  @Patch('orders/:id/approve')
  @ApiOperation({ summary: 'Ishni boshlashga ruxsat berish (naqd to\'lov)' })
  async approveWorkStart(@Param('id') id: string) {
    return this.adminService.approveWorkStart(id);
  }

  @Get('orders/:id/detail')
  @ApiOperation({ summary: 'Buyurtma batafsil ma\'lumoti' })
  async getOrderById(@Param('id') id: string) {
    return this.adminService.getOrderById(id);
  }

  // ==================== COMPLAINTS ====================

  @Get('complaints')
  @ApiOperation({ summary: 'Shikoyatlar ro\'yxati' })
  @ApiQuery({ name: 'status', required: false })
  async getComplaints(@Query('status') status?: string) {
    return this.adminService.getComplaints(status);
  }

  @Patch('complaints/:id/resolve')
  @ApiOperation({ summary: 'Shikoyatni hal qilish' })
  async resolveComplaint(
    @Param('id') id: string,
    @Body() dto: { adminNote: string },
  ) {
    return this.adminService.resolveComplaint(id, dto.adminNote);
  }

  // ==================== DEVICE CHANGE REQUESTS ====================

  @Get('device-requests')
  @ApiOperation({ summary: 'Qurilma o\'zgartirish so\'rovlari' })
  @ApiQuery({ name: 'status', required: false })
  async getDeviceRequests(@Query('status') status?: string) {
    return this.adminService.getDeviceChangeRequests(status);
  }

  @Patch('device-requests/:id/approve')
  @ApiOperation({ summary: 'Qurilma o\'zgarishini tasdiqlash' })
  async approveDeviceChange(@Param('id') id: string) {
    return this.adminService.approveDeviceChange(id);
  }

  @Patch('device-requests/:id/reject')
  @ApiOperation({ summary: 'Qurilma o\'zgarishini rad etish' })
  async rejectDeviceChange(
    @Param('id') id: string,
    @Body() dto: { reason: string },
  ) {
    return this.adminService.rejectDeviceChange(id, dto.reason);
  }

  // ==================== BROADCAST ====================

  @Post('notifications/broadcast')
  @ApiOperation({ summary: 'Ommaviy xabar yuborish' })
  async broadcastNotification(
    @Body() dto: { title: string; body: string; targetRole?: string },
  ) {
    return this.adminService.broadcastNotification(dto);
  }

  // ==================== SETTINGS ====================

  @Get('settings')
  @ApiOperation({ summary: 'Platforma sozlamalari' })
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Sozlamalarni yangilash' })
  async updateSettings(@Body() dto: { key: string; value: string }) {
    return this.adminService.updateSettings(dto.key, dto.value);
  }

  // ==================== TARIFFS ====================

  @Get('tariffs')
  @ApiOperation({ summary: 'Barcha tariflar ro\'yxati' })
  async getTariffs() {
    return this.adminService.getTariffs();
  }

  @Post('tariffs')
  @ApiOperation({ summary: 'Yangi tarif yaratish' })
  async createTariff(
    @Body()
    dto: {
      name: string;
      type: string;
      price: number;
      duration: number;
      description?: string;
    },
  ) {
    return this.adminService.createTariff(dto);
  }

  @Patch('tariffs/:id')
  @ApiOperation({ summary: 'Tarifni tahrirlash' })
  async updateTariff(
    @Param('id') id: string,
    @Body()
    dto: {
      name?: string;
      type?: string;
      price?: number;
      duration?: number;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.adminService.updateTariff(id, dto);
  }

  @Delete('tariffs/:id')
  @ApiOperation({ summary: 'Tarifni o\'chirish' })
  async deleteTariff(@Param('id') id: string) {
    return this.adminService.deleteTariff(id);
  }

  // ==================== GEO ====================

  @Get('masters/live-locations')
  @ApiOperation({ summary: 'Barcha online ustalarning jonli joylashuvi' })
  async getLiveMasterLocations() {
    return this.adminService.getLiveMasterLocations();
  }

  @Get('masters/:id/location')
  @ApiOperation({ summary: 'Usta joylashuvi tarixi' })
  async getMasterLocation(@Param('id') id: string) {
    return this.adminService.getMasterGeoLocation(id);
  }
}

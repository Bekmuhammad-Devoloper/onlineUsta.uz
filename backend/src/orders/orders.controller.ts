import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto, SendContractDto, ChoosePaymentDto, ReviewDto, CancelOrderDto } from './dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi buyurtma yaratish' })
  async create(@Request() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Buyurtmalar ro\'yxatini olish (rol bo\'yicha)' })
  async findAll(@Request() req) {
    return this.ordersService.findAll(req.user.id, req.user.role, req.user.masterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buyurtma tafsilotini olish' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Usta buyurtmani qabul qiladi' })
  async accept(@Param('id') id: string, @Request() req) {
    return this.ordersService.accept(id, req.user.id);
  }

  @Patch(':id/contract')
  @ApiOperation({ summary: 'Usta shartnoma (narx) yuboradi' })
  async sendContract(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: SendContractDto,
  ) {
    return this.ordersService.sendContract(id, req.user.id, dto.amount, dto.description);
  }

  @Patch(':id/choose-payment')
  @ApiOperation({ summary: 'Foydalanuvchi to\'lov turini tanlaydi' })
  async choosePayment(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: ChoosePaymentDto,
  ) {
    return this.ordersService.choosePaymentType(id, req.user.id, dto.paymentType);
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Ishni boshlash' })
  async start(@Param('id') id: string) {
    return this.ordersService.start(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Ishni tugallash' })
  async complete(@Param('id') id: string) {
    return this.ordersService.complete(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Buyurtmani bekor qilish' })
  async cancel(@Param('id') id: string, @Request() req, @Body() dto: CancelOrderDto) {
    return this.ordersService.cancel(id, req.user.id, dto.reason);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Tugallangan buyurtmaga baho qo\'yish' })
  async addReview(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: ReviewDto,
  ) {
    return this.ordersService.addReview(id, req.user.id, dto.rating, dto.comment);
  }
}

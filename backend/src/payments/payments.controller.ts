import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate payment' })
  async initiate(@Body() dto: { orderId: string; type: 'PAYME' | 'CLICK' }) {
    return this.paymentsService.initiatePayment(dto.orderId, dto.type);
  }

  @Post('callback/:type')
  @ApiOperation({ summary: 'Payment gateway callback' })
  async callback(@Param('type') type: string, @Body() data: any) {
    return this.paymentsService.handleCallback(type, data);
  }

  @Post('cash-confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm cash payment' })
  async confirmCash(@Request() req, @Body() dto: { orderId: string }) {
    return this.paymentsService.confirmCashPayment(dto.orderId, req.user.id);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history' })
  async getHistory(@Request() req) {
    return this.paymentsService.getPaymentHistory(req.user.id, req.user.role);
  }
}

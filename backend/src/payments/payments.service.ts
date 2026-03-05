import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async initiatePayment(orderId: string, type: 'PAYME' | 'CLICK') {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.amount) {
      throw new BadRequestException('Invalid order or amount not set');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount: order.amount,
        type,
        status: 'PENDING',
      },
    });

    // Generate payment URL based on type
    let paymentUrl: string;

    if (type === 'PAYME') {
      paymentUrl = await this.generatePaymeUrl(payment.id, order.amount);
    } else if (type === 'CLICK') {
      paymentUrl = await this.generateClickUrl(payment.id, order.amount);
    }

    return {
      paymentId: payment.id,
      paymentUrl,
    };
  }

  async handleCallback(type: string, data: any) {
    // Handle payment gateway callback
    // This is simplified - actual implementation needs proper signature verification

    const transactionId = data.transaction_id || data.click_trans_id;
    const status = data.status === 'success' ? 'COMPLETED' : 'FAILED';

    const payment = await this.prisma.payment.findFirst({
      where: { transactionId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        gatewayResponse: data,
        paidAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    // If successful, update order status
    if (status === 'COMPLETED') {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAYMENT_DONE' },
      });
    }

    return { success: true };
  }

  async confirmCashPayment(orderId: string, masterId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.masterId !== masterId) {
      throw new BadRequestException('Invalid order');
    }

    // Create payment record for cash
    await this.prisma.payment.create({
      data: {
        orderId,
        amount: order.amount,
        type: 'CASH',
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    // Update order - admin must approve before work starts
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAYMENT_PENDING' },
    });

    return { message: 'Cash payment confirmed, waiting for admin approval' };
  }

  async getPaymentHistory(userId: string, role: string) {
    const where: any = {};

    if (role === 'USER') {
      where.order = { userId };
    } else if (role === 'MASTER') {
      where.order = { masterId: userId };
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            user: true,
            master: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generatePaymeUrl(paymentId: string, amount: number): Promise<string> {
    const merchantId = this.config.get('PAYME_MERCHANT_ID');
    const callbackUrl = `${this.config.get('APP_URL')}/payments/callback/payme`;
    
    // Payme URL format
    const params = Buffer.from(
      JSON.stringify({
        merchant_id: merchantId,
        amount: amount * 100, // Convert to tiyin
        account: { order_id: paymentId },
        callback: callbackUrl,
      }),
    ).toString('base64');

    return `https://checkout.paycom.uz/${params}`;
  }

  private async generateClickUrl(paymentId: string, amount: number): Promise<string> {
    const merchantId = this.config.get('CLICK_MERCHANT_ID');
    const serviceId = this.config.get('CLICK_SERVICE_ID');
    const returnUrl = `${this.config.get('APP_URL')}/payments/callback/click`;

    return `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${paymentId}&return_url=${returnUrl}`;
  }
}

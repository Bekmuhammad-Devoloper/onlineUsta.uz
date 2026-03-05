import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const isFreelance = !dto.categoryId;

    // Regionni address dan ajratib olish (agar region berilmasa)
    const region = dto.region || this.extractRegion(dto.address);

    const order = await this.prisma.order.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        description: dto.description,
        address: dto.address,
        contactPhone: dto.contactPhone,
        latitude: dto.latitude,
        longitude: dto.longitude,
        preferredDate: dto.preferredDate,
        preferredTime: dto.preferredTime,
        images: dto.images || [],
        status: 'PENDING',
        isFreelance,
        region,
      },
      include: {
        user: { select: { name: true } },
        category: true,
      },
    });

    // Notify only matching masters (category + location + active tariff)
    if (dto.categoryId) {
      await this.notifyEligibleMasters(dto.categoryId, region, order);
    }

    return order;
  }

  // Addressdan viloyat nomini ajratib olish
  private extractRegion(address: string): string | null {
    if (!address) return null;
    // Birinchi vergulgacha yoki to'liq address
    const parts = address.split(',');
    return parts[0]?.trim() || null;
  }

  async findAll(userId: string, role: string, masterId?: string) {
    if (role === 'MASTER' && masterId) {
      return this.prisma.order.findMany({
        where: { masterId: userId },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          category: true,
          review: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'USER') {
      return this.prisma.order.findMany({
        where: { userId },
        include: {
          master: { select: { id: true, name: true } },
          category: true,
          review: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'ADMIN') {
      return this.prisma.order.findMany({
        include: {
          user: { select: { id: true, name: true, phone: true } },
          master: { select: { id: true, name: true } },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true, phone: true } },
        master: { select: { id: true, name: true, avatar: true } },
        category: true,
        review: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Buyurtma topilmadi');
    }

    return order;
  }

  async accept(orderId: string, masterId: string) {
    // TZ: Bir vaqtda faqat BITTA buyurtmani qabul qila oladi
    const activeOrder = await this.prisma.order.findFirst({
      where: {
        masterId,
        status: {
          in: ['ACCEPTED', 'CONTRACT_SENT', 'PAYMENT_PENDING', 'PAYMENT_DONE', 'IN_PROGRESS'],
        },
      },
    });

    if (activeOrder) {
      throw new BadRequestException('Sizda faol buyurtma mavjud. Avval uni tugallang');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.status !== 'PENDING') {
      throw new BadRequestException('Buyurtma topilmadi yoki allaqachon qabul qilingan');
    }

    const master = await this.prisma.master.findUnique({
      where: { userId: masterId },
      include: {
        user: true,
        subscriptions: {
          where: {
            status: 'ACTIVE',
            endDate: { gte: new Date() },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!master) {
      throw new BadRequestException('Usta profili topilmadi');
    }

    // 1. KATEGORIYA TEKSHIRUVI: Usta faqat o'z kategoriyasidagi buyurtmalarni qabul qila oladi
    if (!order.isFreelance && order.categoryId) {
      if (master.categoryId !== order.categoryId) {
        throw new BadRequestException('Bu buyurtma sizning kategoriyangizga tegishli emas');
      }
    }

    // 2. LOKATSIYA TEKSHIRUVI: Usta faqat o'z hududidagi buyurtmalarni qabul qila oladi
    if (order.region && master.user.location) {
      const masterRegion = master.user.location.split(',')[0]?.trim().toLowerCase();
      const orderRegion = order.region.trim().toLowerCase();
      if (masterRegion !== orderRegion) {
        throw new BadRequestException(
          `Bu buyurtma sizning hududingizga tegishli emas. Buyurtma hududi: ${order.region}`,
        );
      }
    }

    // 3. TARIF TEKSHIRUVI: Usta admin belgilagan tariflardan birida bo'lishi kerak
    if (master.subscriptions.length === 0) {
      // Commission tizimida bo'lsa, ruxsat berish (default)
      if (master.subscriptionType !== 'COMMISSION') {
        throw new BadRequestException(
          'Sizda faol obuna mavjud emas. Buyurtma qabul qilish uchun tariflardan birini tanlang',
        );
      }
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        masterId,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      include: {
        user: true,
        master: true,
      },
    });

    // Notify user
    await this.notifications.create({
      userId: updatedOrder.userId,
      title: 'Buyurtma qabul qilindi',
      body: 'Ustangiz buyurtmangizni qabul qildi',
      type: 'ORDER_ACCEPTED',
      data: { orderId: updatedOrder.id },
    });

    return updatedOrder;
  }

  async sendContract(orderId: string, masterId: string, amount: number, description?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.masterId !== masterId) {
      throw new ForbiddenException('Ruxsat yo\'q');
    }

    if (order.status !== 'ACCEPTED') {
      throw new BadRequestException('Buyurtma ACCEPTED holatda bo\'lishi kerak');
    }

    // Calculate platform fee (12% per TZ)
    const commissionRate = 0.12;
    const platformFee = amount * commissionRate;
    const masterAmount = amount - platformFee;

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        amount,
        platformFee,
        masterAmount,
        contractDescription: description,
        status: 'CONTRACT_SENT',
        contractSentAt: new Date(),
      },
      include: { user: true },
    });

    // Notify user
    await this.notifications.create({
      userId: updatedOrder.userId,
      title: 'Shartnoma yuborildi',
      body: `Narx: ${amount.toLocaleString()} so'm`,
      type: 'CONTRACT_SENT',
      data: { orderId: updatedOrder.id, amount },
    });

    return updatedOrder;
  }

  // TZ: Foydalanuvchi to'lov turini tanlaydi (Payme, Click, Naqd)
  async choosePaymentType(orderId: string, userId: string, paymentType: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      throw new ForbiddenException('Ruxsat yo\'q');
    }

    if (order.status !== 'CONTRACT_SENT') {
      throw new BadRequestException('Shartnoma yuborilgan bo\'lishi kerak');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentType: paymentType as any,
        status: 'PAYMENT_PENDING',
      },
    });

    return updatedOrder;
  }

  async start(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Buyurtma topilmadi');
    }

    // TZ: Online to'lov bo'lsa PAYMENT_DONE, naqd bo'lsa admin ruxsati kerak
    if (order.paymentType !== 'CASH' && order.status !== 'PAYMENT_DONE') {
      throw new BadRequestException('To\'lov amalga oshirilishi kerak');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
      include: { user: true },
    });

    // Notify user
    await this.notifications.create({
      userId: updatedOrder.userId,
      title: 'Ish boshlandi',
      body: 'Usta ishni boshladi',
      type: 'WORK_STARTED',
      data: { orderId: updatedOrder.id },
    });

    return updatedOrder;
  }

  async complete(orderId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        user: true,
        master: true,
      },
    });

    // Update master statistics
    if (order.masterId) {
      const master = await this.prisma.master.findUnique({
        where: { userId: order.masterId },
      });

      if (master && order.masterAmount) {
        await this.prisma.master.update({
          where: { id: master.id },
          data: {
            totalOrders: { increment: 1 },
            totalEarnings: { increment: order.masterAmount },
            monthlyEarnings: { increment: order.masterAmount },
          },
        });
      }
    }

    // Notify user
    await this.notifications.create({
      userId: order.userId,
      title: 'Ish tugallandi',
      body: 'Iltimos, xizmatni baholang',
      type: 'WORK_COMPLETED',
      data: { orderId: order.id },
    });

    return order;
  }

  async cancel(orderId: string, userId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        master: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Buyurtma topilmadi');
    }

    if (order.userId !== userId && order.masterId !== userId) {
      throw new ForbiddenException('Ruxsat yo\'q');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    // Create cancellation record if master cancelled
    if (order.masterId === userId) {
      const master = await this.prisma.master.findUnique({
        where: { userId },
      });

      if (master) {
        await this.prisma.cancellation.create({
          data: {
            orderId,
            masterId: master.id,
            reason,
            cancelledBy: userId,
          },
        });

        // TZ: Haftalik 4+, oylik 12+ bekor qilish — jarima/bloklash
        await this.prisma.master.update({
          where: { id: master.id },
          data: {
            weeklyCancellations: { increment: 1 },
            monthlyCancellations: { increment: 1 },
            cancellationCount: { increment: 1 },
          },
        });

        await this.checkCancellationPenalty(master.id);
      }
    }

    // Notify both parties
    await this.notifications.create({
      userId: order.userId,
      title: 'Buyurtma bekor qilindi',
      body: reason || 'Buyurtma bekor qilindi',
      type: 'ORDER_CANCELLED',
      data: { orderId: order.id },
    });

    if (order.masterId && order.masterId !== userId) {
      await this.notifications.create({
        userId: order.masterId,
        title: 'Buyurtma bekor qilindi',
        body: reason || 'Buyurtma bekor qilindi',
        type: 'ORDER_CANCELLED',
        data: { orderId: order.id },
      });
    }

    return updatedOrder;
  }

  async addReview(orderId: string, userId: string, rating: number, comment?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      throw new ForbiddenException('Ruxsat yo\'q');
    }

    if (order.status !== 'COMPLETED') {
      throw new BadRequestException('Faqat tugallangan buyurtmaga baho qo\'yish mumkin');
    }

    if (!order.masterId) {
      throw new BadRequestException('Buyurtmaga usta biriktirilmagan');
    }

    // Check if already reviewed
    const existingReview = await this.prisma.review.findUnique({
      where: { orderId },
    });

    if (existingReview) {
      throw new BadRequestException('Siz allaqachon baho qo\'ygansiz');
    }

    const master = await this.prisma.master.findUnique({
      where: { userId: order.masterId },
    });

    if (!master) {
      throw new BadRequestException('Usta topilmadi');
    }

    const review = await this.prisma.review.create({
      data: {
        orderId,
        userId,
        masterId: master.id,
        rating,
        comment,
      },
    });

    // Update master rating
    const allReviews = await this.prisma.review.findMany({
      where: { masterId: master.id },
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await this.prisma.master.update({
      where: { id: master.id },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
      },
    });

    return review;
  }

  // Faqat mos ustalarni xabardor qilish (kategoriya + lokatsiya + faol tarif)
  private async notifyEligibleMasters(
    categoryId: string,
    region: string | null,
    order: any,
  ) {
    const now = new Date();

    // Shu kategoriyaga tegishli, tasdiqlangan va online ustalari
    const masters = await this.prisma.master.findMany({
      where: {
        categoryId,
        isVerified: true,
        isOnline: true,
        // Faol obunasi yoki commission tizimida bo'lishi kerak
        OR: [
          {
            subscriptions: {
              some: {
                status: 'ACTIVE',
                endDate: { gte: now },
              },
            },
          },
          {
            subscriptionType: 'COMMISSION',
          },
        ],
      },
      include: { user: true },
    });

    for (const master of masters) {
      // Lokatsiya tekshiruvi
      if (region && master.user.location) {
        const masterRegion = master.user.location.split(',')[0]?.trim().toLowerCase();
        const orderRegion = region.trim().toLowerCase();
        if (masterRegion !== orderRegion) {
          continue; // Hududi mos kelmasa, o'tkazib yuborish
        }
      }

      await this.notifications.create({
        userId: master.userId,
        title: 'Yangi buyurtma',
        body: order.description.substring(0, 100),
        type: 'ORDER_CREATED',
        data: { orderId: order.id },
      });
    }
  }

  private async checkCancellationPenalty(masterId: string) {
    const master = await this.prisma.master.findUnique({
      where: { id: masterId },
    });

    if (!master) return;

    // TZ defaults: haftalik 4, oylik 12
    const weeklyLimit = await this.prisma.platformSettings.findUnique({
      where: { key: 'weekly_cancellation_limit' },
    });

    const monthlyLimit = await this.prisma.platformSettings.findUnique({
      where: { key: 'monthly_cancellation_limit' },
    });

    const wLimit = weeklyLimit ? parseInt(weeklyLimit.value) : 4;
    const mLimit = monthlyLimit ? parseInt(monthlyLimit.value) : 12;

    // TZ: Oylik 12+ bekor qilish — hisob to'liq bloklanadi
    if (master.monthlyCancellations >= mLimit) {
      await this.prisma.user.update({
        where: { id: master.userId },
        data: { status: 'BLOCKED' },
      });

      await this.notifications.create({
        userId: master.userId,
        title: 'Hisob bloklandi',
        body: 'Oylik bekor qilish limitidan oshdi. Admin bilan bog\'laning',
        type: 'ACCOUNT_BLOCKED',
        data: {},
      });
    }
    // TZ: Haftalik 4+ bekor qilish — jarima belgilanadi
    else if (master.weeklyCancellations >= wLimit) {
      await this.notifications.create({
        userId: master.userId,
        title: 'Jarima belgilandi',
        body: 'Haftalik bekor qilish limitidan oshdi',
        type: 'PENALTY_ISSUED',
        data: {},
      });
    }
  }
}

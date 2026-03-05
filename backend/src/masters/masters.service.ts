import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RegisterMasterDto, UpdateMasterProfileDto } from './dto';

@Injectable()
export class MastersService {
  private readonly logger = new Logger(MastersService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // Haversine formula: 2 nuqta orasidagi masofani km da hisoblash
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Yer radiusi km da
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Mavjud tariflarni olish (ustalar uchun)
  async getAvailableTariffs() {
    return this.prisma.tariff.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async register(userId: string, dto: RegisterMasterDto) {
    // Check if user already has a master profile
    const existing = await this.prisma.master.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('Siz allaqachon usta sifatida ro\'yxatdan o\'tgansiz');
    }

    const master = await this.prisma.master.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        bio: dto.bio,
        services: dto.services || [],
        passportSeries: dto.passportSeries,
        passportNumber: dto.passportNumber,
        passportJSHIR: dto.passportJSHIR,
        passportPhoto: dto.passportPhoto,
        passportPhotoBack: dto.passportPhotoBack,
        bankCardNumber: dto.bankCardNumber,
        bankCardHolder: dto.bankCardHolder,
        isVerified: false, // Admin must verify
      },
      include: { category: true },
    });

    // Update user role
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'MASTER' },
    });

    return master;
  }

  async findAll(categoryId?: string) {
    const masters = await this.prisma.master.findMany({
      where: {
        isVerified: true,
        ...(categoryId && { categoryId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
          },
        },
        category: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // TZ: Usta kartasida shaxsiy telefon raqami ko'rinmaydi
    return masters.map((m) => ({
      id: m.id,
      user: m.user,
      category: m.category,
      bio: m.bio,
      services: m.services,
      rating: m.rating,
      totalReviews: m.totalReviews,
      totalOrders: m.totalOrders,
      isOnline: m.isOnline,
      reviews: m.reviews,
    }));
  }

  async findOne(id: string) {
    const master = await this.prisma.master.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            // TZ: telefon raqami ko'rsatilmaydi, admin raqami ko'rsatiladi
          },
        },
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!master) {
      throw new NotFoundException('Usta topilmadi');
    }

    return {
      id: master.id,
      user: master.user,
      category: master.category,
      bio: master.bio,
      services: master.services,
      rating: master.rating,
      totalReviews: master.totalReviews,
      totalOrders: master.totalOrders,
      isOnline: master.isOnline,
      reviews: master.reviews,
    };
  }

  async updateProfile(masterId: string, dto: UpdateMasterProfileDto) {
    return this.prisma.master.update({
      where: { id: masterId },
      data: {
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.services !== undefined && { services: dto.services }),
        ...(dto.bankCardNumber !== undefined && { bankCardNumber: dto.bankCardNumber }),
        ...(dto.bankCardHolder !== undefined && { bankCardHolder: dto.bankCardHolder }),
      },
    });
  }

  async toggleOnline(masterId: string, isOnline: boolean) {
    const master = await this.prisma.master.findUnique({
      where: { id: masterId },
    });

    if (!master) {
      throw new NotFoundException('Usta topilmadi');
    }

    if (!master.isVerified) {
      throw new ForbiddenException('Hisobingiz hali tasdiqlanmagan');
    }

    return this.prisma.master.update({
      where: { id: masterId },
      data: { isOnline },
    });
  }

  async getAvailableOrders(masterId: string, region?: string) {
    const master = await this.prisma.master.findUnique({
      where: { id: masterId },
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
      throw new NotFoundException('Usta topilmadi');
    }

    // TARIF TEKSHIRUVI: Faol obunasi yoki commission tizimida bo'lishi kerak
    const hasActiveSubscription =
      master.subscriptions.length > 0 || master.subscriptionType === 'COMMISSION';

    if (!hasActiveSubscription) {
      return {
        hasActiveOrder: false,
        availableOrders: [],
        masterRegion: master.user.location || null,
        message: 'Buyurtmalarni ko\'rish uchun tariflardan birini tanlang',
        needsSubscription: true,
      };
    }

    // TZ: Usta FAQAT o'z kategoriyasiga oid buyurtmalarni ko'radi
    // TZ: Bir vaqtda faqat BITTA buyurtmani qabul qila oladi
    const activeOrder = await this.prisma.order.findFirst({
      where: {
        masterId: master.userId,
        status: {
          in: ['ACCEPTED', 'CONTRACT_SENT', 'PAYMENT_PENDING', 'PAYMENT_DONE', 'IN_PROGRESS'],
        },
      },
    });

    if (activeOrder) {
      return {
        hasActiveOrder: true,
        activeOrderId: activeOrder.id,
        availableOrders: [],
        masterRegion: master.user.location || null,
      };
    }

    // LOKATSIYA TEKSHIRUVI: Usta faqat o'z hududidagi buyurtmalarni ko'radi
    const masterRegion = master.user.location
      ? master.user.location.split(',')[0]?.trim()
      : null;

    // Agar region parametr berilgan bo'lsa, uni ishlatamiz, aks holda ustaning locatsiyasini
    const filterRegion = region ? region.split(',')[0]?.trim() : masterRegion;

    const regionFilter = filterRegion
      ? {
          OR: [
            { region: { equals: filterRegion, mode: 'insensitive' as const } },
            { region: null }, // Regioni ko'rsatilmagan buyurtmalarni ham ko'rsatish
          ],
        }
      : {};

    const orders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        masterId: null,
        AND: [
          {
            OR: [
              { categoryId: master.categoryId },
              { isFreelance: true },
            ],
          },
          regionFilter,
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      hasActiveOrder: false,
      availableOrders: orders,
      masterRegion: masterRegion || null,
    };
  }

  async getMasterStats(masterId: string) {
    const master = await this.prisma.master.findUnique({
      where: { id: masterId },
      include: {
        user: {
          select: {
            name: true,
            location: true,
            avatar: true,
          },
        },
        category: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!master) {
      throw new NotFoundException('Usta topilmadi');
    }

    const [completedOrders, cancelledOrders, pendingOrders, activeOrder] = await Promise.all([
      this.prisma.order.count({
        where: { masterId: master.userId, status: 'COMPLETED' },
      }),
      this.prisma.order.count({
        where: { masterId: master.userId, status: 'CANCELLED' },
      }),
      this.prisma.order.count({
        where: {
          masterId: master.userId,
          status: { in: ['ACCEPTED', 'CONTRACT_SENT', 'PAYMENT_PENDING', 'PAYMENT_DONE', 'IN_PROGRESS'] },
        },
      }),
      this.prisma.order.findFirst({
        where: {
          masterId: master.userId,
          status: { in: ['ACCEPTED', 'CONTRACT_SENT', 'PAYMENT_PENDING', 'PAYMENT_DONE', 'IN_PROGRESS'] },
        },
        select: { id: true, status: true, description: true },
      }),
    ]);

    return {
      // Asosiy statistika
      totalOrders: master.totalOrders,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      rating: master.rating,
      totalReviews: master.totalReviews,
      totalEarnings: master.totalEarnings,
      monthlyEarnings: master.monthlyEarnings,

      // Holat
      isOnline: master.isOnline,
      isVerified: master.isVerified,

      // Avatar
      avatar: master.user.avatar || null,
      needsAvatar: !master.user.avatar,

      // Obuna
      subscriptionType: master.subscriptionType,
      activeSubscription: master.subscriptions[0] || null,

      // Bekor qilishlar
      weeklyCancellations: master.weeklyCancellations,
      monthlyCancellations: master.monthlyCancellations,
      cancellationCount: master.cancellationCount,

      // Kategoriya
      category: master.category ? {
        id: master.category.id,
        name: master.category.name,
        nameUz: master.category.nameUz,
        icon: master.category.icon,
      } : null,

      // Hudud
      region: master.user.location || null,

      // Faol buyurtma
      activeOrder: activeOrder || null,
    };
  }

  async updateSubscription(masterId: string, type: string, price: number, tariffId?: string) {
    // Agar tariffId berilgan bo'lsa, admin tarifi bo'yicha tekshirish
    if (tariffId) {
      const tariff = await this.prisma.tariff.findUnique({
        where: { id: tariffId },
      });

      if (!tariff || !tariff.isActive) {
        throw new BadRequestException('Bu tarif mavjud emas yoki faol emas');
      }

      // Tarif ma'lumotlarini ishlatish
      type = tariff.type;
      price = tariff.price;
    } else {
      // Tarif IDsiz — admin belgilagan tariflardan birini tekshirish
      const matchingTariff = await this.prisma.tariff.findFirst({
        where: {
          type: type as any,
          isActive: true,
        },
      });

      if (!matchingTariff && type !== 'COMMISSION') {
        throw new BadRequestException(
          'Bu turdagi faol tarif mavjud emas. Admin tomonidan belgilangan tariflardan birini tanlang',
        );
      }
    }

    const startDate = new Date();
    let endDate = new Date();

    switch (type) {
      case 'DAILY':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'WEEKLY':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'MONTHLY':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'COMMISSION':
        endDate.setFullYear(endDate.getFullYear() + 10);
        break;
    }

    // Expire current active subscriptions
    await this.prisma.subscription.updateMany({
      where: { masterId, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    });

    const subscription = await this.prisma.subscription.create({
      data: {
        masterId,
        tariffId: tariffId || null,
        type: type as any,
        price,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
    });

    await this.prisma.master.update({
      where: { id: masterId },
      data: { subscriptionType: type as any },
    });

    return subscription;
  }

  async requestDeviceChange(masterId: string, newDeviceId: string) {
    const master = await this.prisma.master.findUnique({
      where: { id: masterId },
    });

    if (!master) {
      throw new NotFoundException('Usta topilmadi');
    }

    const request = await this.prisma.deviceChangeRequest.create({
      data: {
        masterId,
        oldDeviceId: master.deviceId,
        newDeviceId,
      },
    });

    return {
      message: 'Qurilma o\'zgartirish so\'rovi yuborildi. Admin tasdiqlashini kuting',
      request,
    };
  }

  async logGeoLocation(masterId: string, latitude: number, longitude: number) {
    // Save geo log
    const geoLog = await this.prisma.geoLog.create({
      data: {
        masterId,
        latitude,
        longitude,
      },
    });

    // Update master's user location coordinates for real-time tracking
    const master = await this.prisma.master.findUnique({
      where: { id: masterId },
      select: { userId: true, user: { select: { name: true } } },
    });

    if (master) {
      await this.prisma.user.update({
        where: { id: master.userId },
        data: { latitude, longitude },
      });

      // PROXIMITY CHECK: Usta faol buyurtma joyiga 1km ichida bormi?
      await this.checkProximityToOrder(masterId, latitude, longitude, master.user.name);
    }

    return geoLog;
  }

  // Usta buyurtma joyiga 1km yaqinlashganda adminga xabar berish
  private async checkProximityToOrder(masterId: string, lat: number, lon: number, masterName: string) {
    try {
      // Ustaning faol buyurtmasini topish
      const master = await this.prisma.master.findUnique({
        where: { id: masterId },
        select: { userId: true },
      });
      if (!master) return;

      const activeOrder = await this.prisma.order.findFirst({
        where: {
          masterId: master.userId,
          status: { in: ['ACCEPTED', 'CONTRACT_SENT', 'PAYMENT_PENDING', 'PAYMENT_DONE', 'IN_PROGRESS'] },
          latitude: { not: null },
          longitude: { not: null },
        },
        select: {
          id: true,
          description: true,
          latitude: true,
          longitude: true,
          address: true,
        },
      });

      if (!activeOrder || !activeOrder.latitude || !activeOrder.longitude) return;

      const distance = this.calculateDistance(lat, lon, activeOrder.latitude, activeOrder.longitude);

      if (distance <= 1.0) {
        // 1km ichida — tekshirish: oxirgi 30 daqiqada xabar yuborilganmi?
        const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
        const recentNotification = await this.prisma.notification.findFirst({
          where: {
            type: 'SYSTEM_MESSAGE',
            createdAt: { gte: thirtyMinAgo },
            title: { contains: 'Yaqinlik bildirishnomasi' },
            data: {
              path: ['orderId'],
              equals: activeOrder.id,
            },
          },
        });

        if (!recentNotification) {
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          const distStr = distance < 0.1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;

          // Barcha adminlarga xabar yuborish
          const admins = await this.prisma.user.findMany({
            where: { role: 'ADMIN', status: 'ACTIVE' },
            select: { id: true },
          });

          for (const admin of admins) {
            await this.notifications.create({
              userId: admin.id,
              title: '📍 Yaqinlik bildirishnomasi',
              body: `${masterName} buyurtma joyiga ${distStr} masofada (${timeStr}). Buyurtma: ${activeOrder.description?.slice(0, 50)}`,
              type: 'SYSTEM_MESSAGE',
              data: {
                orderId: activeOrder.id,
                masterId,
                masterName,
                distance: Math.round(distance * 1000),
                address: activeOrder.address,
                time: timeStr,
                masterLat: lat,
                masterLon: lon,
                orderLat: activeOrder.latitude,
                orderLon: activeOrder.longitude,
              },
            });
          }

          this.logger.log(`🔔 Proximity alert: ${masterName} is ${distStr} from order ${activeOrder.id}`);
        }
      }
    } catch (err) {
      this.logger.error('Proximity check error:', err);
    }
  }

  async getGeoHistory(masterId: string, hours: number = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.prisma.geoLog.findMany({
      where: {
        masterId,
        timestamp: {
          gte: since,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}

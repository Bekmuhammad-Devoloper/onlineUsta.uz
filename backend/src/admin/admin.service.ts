import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ==================== DASHBOARD ====================

  async getDashboard() {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [
      totalUsers,
      totalMasters,
      verifiedMasters,
      activeMasters,
      totalOrders,
      todayOrders,
      monthlyOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      monthlyRevenue,
      platformFees,
      pendingComplaints,
      pendingDeviceRequests,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.master.count(),
      this.prisma.master.count({ where: { isVerified: true } }),
      this.prisma.master.count({ where: { isOnline: true } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.count({ where: { createdAt: { gte: thisMonth } } }),
      this.prisma.order.count({ where: { status: 'COMPLETED' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: thisMonth } },
        _sum: { amount: true },
      }),
      this.prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { platformFee: true },
      }),
      this.prisma.complaint.count({ where: { status: 'PENDING' } }),
      this.prisma.deviceChangeRequest.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      users: { total: totalUsers },
      masters: { total: totalMasters, verified: verifiedMasters, online: activeMasters },
      orders: {
        total: totalOrders,
        today: todayOrders,
        monthly: monthlyOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
        monthly: monthlyRevenue._sum.amount || 0,
        platformFees: platformFees._sum.platformFee || 0,
      },
      pending: {
        complaints: pendingComplaints,
        deviceRequests: pendingDeviceRequests,
      },
    };
  }

  // TZ: Oylik statistika
  async getMonthlyRevenue(months: number = 12) {
    const stats = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const [revenue, orders] = await Promise.all([
        this.prisma.payment.aggregate({
          where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
        this.prisma.order.count({
          where: { status: 'COMPLETED', completedAt: { gte: start, lte: end } },
        }),
      ]);

      stats.push({
        month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        revenue: revenue._sum.amount || 0,
        completedOrders: orders,
      });
    }

    return stats;
  }

  // ==================== CATEGORIES CRUD (TZ Section 5) ====================

  async getCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: { select: { masters: true, orders: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data: { name: string; nameUz: string; icon?: string; image?: string }) {
    return this.prisma.category.create({ data: { name: data.name, nameUz: data.nameUz, icon: data.icon } });
  }

  async updateCategory(id: string, data: { name?: string; nameUz?: string; icon?: string; image?: string }) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    // Check for active orders/masters
    const [masters, activeOrders] = await Promise.all([
      this.prisma.master.count({ where: { categoryId: id } }),
      this.prisma.order.count({
        where: {
          categoryId: id,
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      }),
    ]);

    if (activeOrders > 0) {
      throw new BadRequestException('Bu kategoriyada faol buyurtmalar mavjud. O\'chirish mumkin emas');
    }

    if (masters > 0) {
      throw new BadRequestException(`Bu kategoriyada ${masters} ta usta mavjud. Avval ustalarni o'zgartiring`);
    }

    return this.prisma.category.delete({ where: { id } });
  }

  // ==================== USERS MANAGEMENT ====================

  async getUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, role, status, page = 1, limit = 20 } = params || {};
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          master: { select: { id: true, isVerified: true, isOnline: true, rating: true, categoryId: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== MASTERS MANAGEMENT ====================

  // Get single user by ID with full details
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        master: {
          include: {
            category: true,
            subscriptions: { orderBy: { createdAt: 'desc' }, take: 5 },
          },
        },
        ordersAsUser: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            category: { select: { nameUz: true } },
            master: { select: { name: true } },
          },
        },
        notifications: { orderBy: { createdAt: 'desc' }, take: 10 },
        reviews: { orderBy: { createdAt: 'desc' }, take: 10, include: { order: { select: { description: true } } } },
        complaintsFrom: { orderBy: { createdAt: 'desc' }, take: 10 },
        complaintsAgainst: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    // Count stats
    const [totalOrders, completedOrders, cancelledOrders] = await Promise.all([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.order.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.order.count({ where: { userId, status: 'CANCELLED' } }),
    ]);

    return { ...user, stats: { totalOrders, completedOrders, cancelledOrders } };
  }

  // Get single master by ID with full details + last location
  async getMasterById(masterId: string) {
    const master = await this.prisma.master.findUnique({
      where: { id: masterId },
      include: {
        user: true,
        category: true,
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 5 },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { name: true } }, order: { select: { description: true } } },
        },
        deviceChangeRequests: { orderBy: { createdAt: 'desc' }, take: 5 },
        cancellations: { orderBy: { cancelledAt: 'desc' }, take: 10 },
      },
    });
    if (!master) throw new NotFoundException('Usta topilmadi');

    // Last geo location
    const lastGeo = await this.prisma.geoLog.findFirst({
      where: { masterId },
      orderBy: { timestamp: 'desc' },
    });

    // Active order
    const activeOrder = await this.prisma.order.findFirst({
      where: {
        masterId: master.userId,
        status: { in: ['ACCEPTED', 'CONTRACT_SENT', 'PAYMENT_PENDING', 'PAYMENT_DONE', 'IN_PROGRESS'] },
      },
      include: {
        user: { select: { name: true, phone: true } },
        category: { select: { nameUz: true } },
      },
    });

    // Order stats
    const [totalOrders, completedOrders, cancelledOrders, totalEarnings] = await Promise.all([
      this.prisma.order.count({ where: { masterId: master.userId } }),
      this.prisma.order.count({ where: { masterId: master.userId, status: 'COMPLETED' } }),
      this.prisma.order.count({ where: { masterId: master.userId, status: 'CANCELLED' } }),
      this.prisma.order.aggregate({ where: { masterId: master.userId, status: 'COMPLETED' }, _sum: { masterAmount: true } }),
    ]);

    // Recent orders
    const recentOrders = await this.prisma.order.findMany({
      where: { masterId: master.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true } },
        category: { select: { nameUz: true } },
      },
    });

    return {
      ...master,
      lastLocation: lastGeo,
      activeOrder,
      recentOrders,
      orderStats: {
        total: totalOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        earnings: totalEarnings._sum.masterAmount || 0,
      },
    };
  }

  // Get single order by ID with full details
  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, phone: true, avatar: true } },
        master: { select: { id: true, name: true, phone: true, avatar: true } },
        category: true,
        payments: { orderBy: { createdAt: 'desc' } },
        review: { include: { user: { select: { name: true } } } },
        complaints: { include: { fromUser: { select: { name: true } } } },
        cancellation: true,
      },
    });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    return order;
  }

  async getMasters(params?: {
    search?: string;
    categoryId?: string;
    isVerified?: boolean;
    isOnline?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { search, categoryId, isVerified, isOnline, page = 1, limit = 20 } = params || {};
    const where: any = {};

    if (categoryId) where.categoryId = categoryId;
    if (isVerified !== undefined) where.isVerified = isVerified;
    if (isOnline !== undefined) where.isOnline = isOnline;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { user: { phone: { contains: search } } },
      ];
    }

    const [masters, total] = await Promise.all([
      this.prisma.master.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true, status: true, avatar: true } },
          category: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.master.count({ where }),
    ]);

    return {
      masters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async verifyMaster(masterId: string) {
    const master = await this.prisma.master.update({
      where: { id: masterId },
      data: { isVerified: true },
      include: { user: true },
    });

    await this.notifications.create({
      userId: master.userId,
      title: 'Akkaunt tasdiqlandi',
      body: 'Sizning ustalar profili tasdiqlandi. Endi buyurtmalarni qabul qilishingiz mumkin',
      type: 'SYSTEM_MESSAGE',
      data: {},
    });

    return master;
  }

  async rejectMaster(masterId: string, reason: string) {
    const master = await this.prisma.master.findUnique({
      where: { id: masterId },
    });

    if (!master) throw new NotFoundException('Usta topilmadi');

    await this.notifications.create({
      userId: master.userId,
      title: 'Ariza rad etildi',
      body: `Sabab: ${reason}`,
      type: 'SYSTEM_MESSAGE',
      data: { reason },
    });

    return { message: 'Rad etildi', reason };
  }

  // ==================== USER BLOCKING ====================

  async blockUser(userId: string, reason?: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'BLOCKED' },
    });

    await this.notifications.create({
      userId,
      title: 'Hisob bloklandi',
      body: reason || 'Sizning hisobingiz admin tomonidan bloklandi',
      type: 'ACCOUNT_BLOCKED',
      data: {},
    });

    return user;
  }

  async unblockUser(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });

    // Reset master cancellation counts if applicable
    const master = await this.prisma.master.findUnique({
      where: { userId },
    });

    if (master) {
      await this.prisma.master.update({
        where: { id: master.id },
        data: {
          weeklyCancellations: 0,
          monthlyCancellations: 0,
        },
      });
    }

    return user;
  }

  // ==================== CHANGE USER ROLE ====================

  async changeUserRole(userId: string, role: string) {
    const validRoles = ['USER', 'MASTER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new Error('Noto\'g\'ri rol: ' + role);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Foydalanuvchi topilmadi');
    }

    const oldRole = user.role;

    // Update user role
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });

    // If changing to MASTER, create a Master profile if doesn't exist
    if (role === 'MASTER') {
      const existingMaster = await this.prisma.master.findUnique({
        where: { userId },
      });
      if (!existingMaster) {
        await this.prisma.master.create({
          data: {
            userId,
            isVerified: false,
            isOnline: false,
          },
        });
      }
    }

    // Send notification
    const roleLabels: Record<string, string> = {
      USER: 'Foydalanuvchi',
      MASTER: 'Usta',
      ADMIN: 'Administrator',
    };

    await this.notifications.create({
      userId,
      title: 'Rol o\'zgartirildi',
      body: `Sizning rolingiz ${roleLabels[oldRole] || oldRole} dan ${roleLabels[role] || role} ga o'zgartirildi`,
      type: 'ROLE_CHANGED',
      data: { oldRole, newRole: role },
    });

    return updated;
  }

  // ==================== ORDERS MANAGEMENT ====================

  async getOrders(params?: {
    status?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, categoryId, page = 1, limit = 20 } = params || {};
    const where: any = {};

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true } },
          master: { select: { id: true, name: true } },
          category: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async assignOrderToMaster(orderId: string, masterId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        masterId,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        cancelledAt: null,
        cancellationReason: null,
      },
    });
  }

  // TZ: Naqd to'lov uchun admin ruxsati
  async approveWorkStart(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
    });

    // Notify master
    if (order.masterId) {
      await this.notifications.create({
        userId: order.masterId,
        title: 'Ish boshlashga ruxsat berildi',
        body: 'Admin ishni boshlashga ruxsat berdi',
        type: 'WORK_STARTED',
        data: { orderId },
      });
    }

    // Notify user
    await this.notifications.create({
      userId: order.userId,
      title: 'Ish boshlandi',
      body: 'Admin ruxsati bilan ish boshlandi',
      type: 'WORK_STARTED',
      data: { orderId },
    });

    return updatedOrder;
  }

  // ==================== COMPLAINTS ====================

  async getComplaints(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.complaint.findMany({
      where,
      include: {
        fromUser: { select: { id: true, name: true, phone: true } },
        againstUser: { select: { id: true, name: true, phone: true } },
        order: { select: { id: true, description: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveComplaint(complaintId: string, adminNote: string) {
    const complaint = await this.prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: 'RESOLVED',
        adminNote,
        resolvedAt: new Date(),
      },
    });

    // Notify the complainer
    await this.notifications.create({
      userId: complaint.fromUserId,
      title: 'Shikoyat ko\'rib chiqildi',
      body: adminNote,
      type: 'SYSTEM_MESSAGE',
      data: { complaintId },
    });

    return complaint;
  }

  // ==================== DEVICE CHANGE REQUESTS (TZ) ====================

  async getDeviceChangeRequests(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.deviceChangeRequest.findMany({
      where,
      include: {
        master: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveDeviceChange(requestId: string) {
    const request = await this.prisma.deviceChangeRequest.findUnique({
      where: { id: requestId },
      include: { master: true },
    });

    if (!request) throw new NotFoundException('So\'rov topilmadi');

    // Update master's device
    await this.prisma.master.update({
      where: { id: request.masterId },
      data: { deviceId: request.newDeviceId },
    });

    await this.prisma.deviceChangeRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED', resolvedAt: new Date() },
    });

    await this.notifications.create({
      userId: request.master.userId,
      title: 'Qurilma o\'zgarishi tasdiqlandi',
      body: 'Admin yangi qurilmangizni tasdiqladi',
      type: 'SYSTEM_MESSAGE',
      data: {},
    });

    return { message: 'Tasdiqlandi' };
  }

  async rejectDeviceChange(requestId: string, reason: string) {
    const request = await this.prisma.deviceChangeRequest.findUnique({
      where: { id: requestId },
      include: { master: true },
    });

    if (!request) throw new NotFoundException('So\'rov topilmadi');

    await this.prisma.deviceChangeRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', resolvedAt: new Date(), adminNote: reason },
    });

    await this.notifications.create({
      userId: request.master.userId,
      title: 'Qurilma o\'zgarishi rad etildi',
      body: `Sabab: ${reason}`,
      type: 'SYSTEM_MESSAGE',
      data: { reason },
    });

    return { message: 'Rad etildi', reason };
  }

  // ==================== BROADCAST NOTIFICATIONS ====================

  async broadcastNotification(data: {
    title: string;
    body: string;
    targetRole?: string;
  }) {
    const where: any = { status: 'ACTIVE' };
    if (data.targetRole) where.role = data.targetRole;

    const users = await this.prisma.user.findMany({
      where,
      select: { id: true },
    });

    for (const user of users) {
      await this.notifications.create({
        userId: user.id,
        title: data.title,
        body: data.body,
        type: 'SYSTEM_MESSAGE',
        data: {},
      });
    }

    return { message: `${users.length} ta foydalanuvchiga yuborildi` };
  }

  // ==================== SETTINGS ====================

  async updateSettings(key: string, value: string) {
    return this.prisma.platformSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getSettings() {
    return this.prisma.platformSettings.findMany();
  }

  // ==================== TARIFFS MANAGEMENT ====================

  async getTariffs() {
    return this.prisma.tariff.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTariff(data: {
    name: string;
    type: string;
    price: number;
    duration: number;
    description?: string;
  }) {
    return this.prisma.tariff.create({
      data: {
        name: data.name,
        type: data.type as any,
        price: data.price,
        duration: data.duration,
        description: data.description,
      },
    });
  }

  async updateTariff(
    id: string,
    data: {
      name?: string;
      type?: string;
      price?: number;
      duration?: number;
      description?: string;
      isActive?: boolean;
    },
  ) {
    const tariff = await this.prisma.tariff.findUnique({ where: { id } });
    if (!tariff) throw new NotFoundException('Tarif topilmadi');

    return this.prisma.tariff.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type as any }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deleteTariff(id: string) {
    const tariff = await this.prisma.tariff.findUnique({ where: { id } });
    if (!tariff) throw new NotFoundException('Tarif topilmadi');

    return this.prisma.tariff.delete({ where: { id } });
  }

  // ==================== GEO TRACKING ====================

  async getMasterGeoLocation(masterId: string) {
    return this.prisma.geoLog.findMany({
      where: { masterId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  // Barcha online ustalarning joriy joylashuvi + faol buyurtma joylari
  async getLiveMasterLocations() {
    // Online ustalar
    const onlineMasters = await this.prisma.master.findMany({
      where: { isOnline: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            latitude: true,
            longitude: true,
            avatar: true,
          },
        },
        category: {
          select: { id: true, name: true },
        },
      },
    });

    // Har bir usta uchun oxirgi geo log + faol buyurtma
    const result = await Promise.all(
      onlineMasters.map(async (master) => {
        const lastGeo = await this.prisma.geoLog.findFirst({
          where: { masterId: master.id },
          orderBy: { timestamp: 'desc' },
        });

        const activeOrder = await this.prisma.order.findFirst({
          where: {
            masterId: master.userId,
            status: { in: ['ACCEPTED', 'CONTRACT_SENT', 'PAYMENT_PENDING', 'PAYMENT_DONE', 'IN_PROGRESS'] },
          },
          select: {
            id: true,
            description: true,
            latitude: true,
            longitude: true,
            address: true,
            status: true,
          },
        });

        return {
          masterId: master.id,
          userId: master.userId,
          name: master.user.name,
          phone: master.user.phone,
          avatar: master.user.avatar,
          category: master.category?.name || null,
          isOnline: master.isOnline,
          currentLocation: lastGeo
            ? {
                latitude: lastGeo.latitude,
                longitude: lastGeo.longitude,
                timestamp: lastGeo.timestamp,
              }
            : master.user.latitude && master.user.longitude
            ? {
                latitude: master.user.latitude,
                longitude: master.user.longitude,
                timestamp: null,
              }
            : null,
          activeOrder: activeOrder
            ? {
                id: activeOrder.id,
                description: activeOrder.description,
                latitude: activeOrder.latitude,
                longitude: activeOrder.longitude,
                address: activeOrder.address,
                status: activeOrder.status,
              }
            : null,
        };
      }),
    );

    return result;
  }
}

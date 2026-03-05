import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, BecomeMasterDto, CreateComplaintDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        master: {
          include: {
            category: true,
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      location: user.location,
      latitude: user.latitude,
      longitude: user.longitude,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      createdAt: user.createdAt,
      isMaster: !!user.master,
      master: user.master
        ? {
            id: user.master.id,
            categoryId: user.master.categoryId,
            category: user.master.category ? {
              id: user.master.category.id,
              name: user.master.category.name,
              nameUz: user.master.category.nameUz,
              icon: user.master.category.icon,
            } : null,
            categoryName: user.master.category?.nameUz,
            bio: user.master.bio,
            services: user.master.services,
            rating: user.master.rating,
            totalReviews: user.master.totalReviews,
            totalOrders: user.master.totalOrders,
            isVerified: user.master.isVerified,
            isOnline: user.master.isOnline,
            subscriptionType: user.master.subscriptionType,
            totalEarnings: user.master.totalEarnings,
            monthlyEarnings: user.master.monthlyEarnings,
            activeSubscription: user.master.subscriptions[0] || null,
          }
        : null,
    };
  }

  async update(id: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
      include: { master: true },
    });

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      location: user.location,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      isMaster: !!user.master,
    };
  }

  async becomeMaster(userId: string, dto: BecomeMasterDto) {
    // Check if user already has a master profile
    const existing = await this.prisma.master.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('Siz allaqachon usta sifatida ro\'yxatdan o\'tgansiz');
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Kategoriya topilmadi');
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
        subscriptionType: dto.subscriptionType || 'COMMISSION',
        isVerified: false, // Admin must verify
      },
      include: { category: true },
    });

    // Update user role
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'MASTER' },
    });

    return {
      message: 'Usta sifatida ro\'yxatdan o\'tdingiz. Admin tasdiqlashini kuting',
      master: {
        id: master.id,
        categoryName: master.category?.nameUz,
        isVerified: master.isVerified,
      },
    };
  }

  async getOrderHistory(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        master: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        review: true,
        payments: {
          where: { status: 'COMPLETED' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createComplaint(userId: string, dto: CreateComplaintDto) {
    // Verify against user exists
    const againstUser = await this.prisma.user.findUnique({
      where: { id: dto.againstUserId },
    });

    if (!againstUser) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        fromUserId: userId,
        againstUserId: dto.againstUserId,
        orderId: dto.orderId,
        description: dto.description,
      },
    });

    return {
      message: 'Shikoyatingiz qabul qilindi',
      complaint,
    };
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}

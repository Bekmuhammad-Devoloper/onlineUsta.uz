import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { masters: true },
        },
      },
      orderBy: [{ order: 'asc' }, { nameUz: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        masters: {
          where: { isVerified: true, isOnline: true },
          select: {
            id: true,
            userId: true,
            rating: true,
            totalReviews: true,
            totalOrders: true,
            bio: true,
            services: true,
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          take: 20,
          orderBy: { rating: 'desc' },
        },
        _count: {
          select: { masters: true, orders: true },
        },
      },
    });
  }

  async getMastersByCategory(categoryId: string) {
    return this.prisma.master.findMany({
      where: {
        categoryId,
        isVerified: true,
      },
      select: {
        id: true,
        userId: true,
        rating: true,
        totalReviews: true,
        totalOrders: true,
        bio: true,
        isOnline: true,
        services: true,
        user: {
          select: { id: true, name: true, avatar: true, location: true },
        },
      },
      orderBy: [
        { isOnline: 'desc' },
        { rating: 'desc' },
      ],
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async create(data: {
    userId: string;
    title: string;
    body: string;
    type: any;
    data?: any;
  }) {
    const notification = await this.prisma.notification.create({
      data,
    });

    // Send push notification via FCM
    await this.sendPushNotification(data.userId, data.title, data.body, data.data);

    return notification;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  private async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
  ) {
    try {
      const fcmServerKey = this.config.get('FCM_SERVER_KEY');
      if (!fcmServerKey) {
        this.logger.log(`Push (no FCM key) to ${userId}: ${title}`);
        return;
      }

      // Get user's FCM token
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true },
      });

      if (!user?.fcmToken) {
        this.logger.log(`Push (no token) to ${userId}: ${title}`);
        return;
      }

      await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        {
          to: user.fcmToken,
          notification: { title, body },
          data: data || {},
        },
        {
          headers: {
            Authorization: `key=${fcmServerKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Push sent to ${userId}: ${title}`);
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
    }
  }
}

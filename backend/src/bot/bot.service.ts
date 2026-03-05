import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);
  private readonly frontendUrl: string;

  constructor(
    @InjectBot() private bot: Telegraf,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.frontendUrl = this.config.get<string>('FRONTEND_URL', 'https://onlineusta.uz');
  }

  // ===== Foydalanuvchiga xabar yuborish =====
  async sendMessageToUser(telegramChatId: string | number, text: string, extra?: any) {
    try {
      await this.bot.telegram.sendMessage(telegramChatId, text, {
        parse_mode: 'HTML',
        ...extra,
      });
      return true;
    } catch (err) {
      this.logger.error(`Failed to send message to ${telegramChatId}: ${err.message}`);
      return false;
    }
  }

  // ===== Yangi buyurtma haqida ustaga xabar =====
  async notifyMasterNewOrder(masterUserId: string, order: any) {
    const user = await this.prisma.user.findUnique({ where: { id: masterUserId } });
    if (!user?.telegramChatId) return;

    const text = `🆕 <b>Yangi buyurtma!</b>\n\n` +
      `📋 <b>Tavsif:</b> ${order.description || 'Ko\'rsatilmagan'}\n` +
      `📍 <b>Manzil:</b> ${order.address || 'Ko\'rsatilmagan'}\n` +
      `💰 <b>Narx:</b> ${order.price ? order.price.toLocaleString() + ' so\'m' : 'Kelishiladi'}\n` +
      `👤 <b>Mijoz:</b> ${order.user?.name || 'Foydalanuvchi'}\n\n` +
      `🔗 <a href="${this.frontendUrl}/master/orders/${order.id}">Buyurtmani ko'rish</a>`;

    await this.sendMessageToUser(user.telegramChatId, text);
  }

  // ===== Buyurtma holati o'zgarganda xabar =====
  async notifyOrderStatusChange(userId: string, order: any, newStatus: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.telegramChatId) return;

    const statusLabels: Record<string, string> = {
      PENDING: '⏳ Kutilmoqda',
      ACCEPTED: '✅ Qabul qilindi',
      IN_PROGRESS: '🔨 Bajarilmoqda',
      COMPLETED: '🎉 Tugallandi',
      CANCELLED: '❌ Bekor qilindi',
      CONTRACT_SENT: '📄 Shartnoma yuborildi',
      PAYMENT_PENDING: '💳 To\'lov kutilmoqda',
      PAYMENT_DONE: '💰 To\'lov qilindi',
    };

    const statusText = statusLabels[newStatus] || newStatus;
    const text = `📦 <b>Buyurtma holati o'zgardi</b>\n\n` +
      `🔄 <b>Yangi holat:</b> ${statusText}\n` +
      `📋 <b>Buyurtma:</b> ${order.description?.slice(0, 50) || 'Buyurtma'}\n\n` +
      `🔗 <a href="${this.frontendUrl}/orders/${order.id}">Batafsil ko'rish</a>`;

    await this.sendMessageToUser(user.telegramChatId, text);
  }

  // ===== Usta tasdiqlanganda xabar =====
  async notifyMasterVerified(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.telegramChatId) return;

    const text = `🎉 <b>Tabriklaymiz!</b>\n\n` +
      `Sizning usta profilingiz <b>tasdiqlandi</b>! ✅\n\n` +
      `Endi buyurtmalar qabul qilishingiz mumkin.\n\n` +
      `🔗 <a href="${this.frontendUrl}/master">Usta paneliga o'tish</a>`;

    await this.sendMessageToUser(user.telegramChatId, text);
  }

  // ===== Admin uchun yangi usta xabari =====
  async notifyAdminNewMaster(masterName: string, categoryName: string) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', telegramChatId: { not: null } },
    });

    const text = `👷 <b>Yangi usta ro'yxatdan o'tdi!</b>\n\n` +
      `👤 <b>Ism:</b> ${masterName}\n` +
      `🔧 <b>Kategoriya:</b> ${categoryName}\n\n` +
      `🔗 <a href="${this.frontendUrl}/admin/masters">Ustalar ro'yxatiga o'tish</a>`;

    for (const admin of admins) {
      await this.sendMessageToUser(admin.telegramChatId, text);
    }
  }

  // ===== Statistika olish =====
  async getStats() {
    const [usersCount, mastersCount, ordersCount, activeOrders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.master.count(),
      this.prisma.order.count(),
      this.prisma.order.count({
        where: { status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } },
      }),
    ]);

    return { usersCount, mastersCount, ordersCount, activeOrders };
  }

  // ===== Kategoriyalar ro'yxati =====
  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, nameUz: true, icon: true },
    });
  }

  // ===== Foydalanuvchini telegram chat id bilan bog'lash =====
  async linkTelegramAccount(phone: string, chatId: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({ where: { phone } });
    if (!user) return false;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: chatId },
    });
    return true;
  }

  // ===== Foydalanuvchini chat id bo'yicha topish =====
  async findUserByChatId(chatId: string): Promise<any> {
    return this.prisma.user.findFirst({
      where: { telegramChatId: chatId },
      include: {
        master: { include: { category: true } },
      },
    });
  }

  // ===== Foydalanuvchining buyurtmalari =====
  async getUserOrders(userId: string, limit = 5) {
    return this.prisma.order.findMany({
      where: { OR: [{ userId }, { masterId: userId }] },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true, phone: true } },
        category: { select: { nameUz: true, icon: true } },
      },
    });
  }
}

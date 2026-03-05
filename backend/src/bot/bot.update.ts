import { Update, Ctx, Start, Help, Command, On, Hears } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { BotService } from './bot.service';
import { Logger } from '@nestjs/common';

interface BotContext extends Context {
  session?: any;
  wizard?: any;
}

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);
  // Telefon raqam kutayotgan foydalanuvchilar
  private readonly awaitingPhone = new Map<number, boolean>();

  constructor(private botService: BotService) {}

  // ===== /start =====
  @Start()
  async onStart(@Ctx() ctx: BotContext) {
    const chatId = ctx.chat.id.toString();
    const user = await this.botService.findUserByChatId(chatId);

    if (user) {
      // Allaqachon bog'langan
      await this.showMainMenu(ctx, user);
      return;
    }

    const firstName = ctx.from?.first_name || 'Foydalanuvchi';

    await ctx.replyWithHTML(
      `👋 <b>Assalomu alaykum, ${firstName}!</b>\n\n` +
      `🔧 <b>Online Usta</b> — Usta topish va xizmat buyurtma qilish platformasi\n\n` +
      `📱 Platformadan to'liq foydalanish uchun hisobingizni bog'lang.\n\n` +
      `Quyidagi tugmani bosing va <b>Online Usta</b> dagi telefon raqamingizni yuboring:`,
      Markup.keyboard([
        [Markup.button.contactRequest('📱 Telefon raqamni yuborish')],
        ['🌐 Saytga o\'tish'],
      ]).resize(),
    );
  }

  // ===== Telefon raqamni qabul qilish (kontakt orqali) =====
  @On('contact')
  async onContact(@Ctx() ctx: BotContext) {
    const contact = (ctx.message as any)?.contact;
    if (!contact?.phone_number) return;

    let phone = contact.phone_number;
    // +998 formatga keltirish
    if (!phone.startsWith('+')) phone = '+' + phone;

    const chatId = ctx.chat.id.toString();
    const linked = await this.botService.linkTelegramAccount(phone, chatId);

    if (linked) {
      const user = await this.botService.findUserByChatId(chatId);
      await ctx.replyWithHTML(
        `✅ <b>Muvaffaqiyatli bog'landi!</b>\n\n` +
        `👤 <b>Ism:</b> ${user?.name || 'Foydalanuvchi'}\n` +
        `📱 <b>Telefon:</b> ${phone}\n` +
        `🏷️ <b>Rol:</b> ${user?.role === 'ADMIN' ? '👑 Admin' : user?.role === 'MASTER' ? '🔧 Usta' : '👤 Foydalanuvchi'}\n\n` +
        `Endi bot orqali bildirishnomalar olasiz!`,
      );
      await this.showMainMenu(ctx, user);
    } else {
      await ctx.replyWithHTML(
        `❌ <b>Foydalanuvchi topilmadi!</b>\n\n` +
        `<code>${phone}</code> raqami bilan hech kim ro'yxatdan o'tmagan.\n\n` +
        `📲 Avval saytda ro'yxatdan o'ting:\n` +
        `🔗 https://onlineusta.uz/auth/register`,
        Markup.keyboard([
          [Markup.button.contactRequest('📱 Qayta urinish')],
          ['🌐 Saytga o\'tish'],
        ]).resize(),
      );
    }
  }

  // ===== Asosiy menu =====
  private async showMainMenu(ctx: BotContext, user: any) {
    const roleName = user.role === 'ADMIN' ? '👑 Admin' : user.role === 'MASTER' ? '🔧 Usta' : '👤 Foydalanuvchi';

    const keyboard = [];

    if (user.role === 'ADMIN') {
      keyboard.push(
        ['📊 Statistika', '👥 Foydalanuvchilar'],
        ['🔧 Ustalar', '📦 Buyurtmalar'],
        ['⚙️ Admin panel'],
      );
    } else if (user.role === 'MASTER') {
      keyboard.push(
        ['📦 Buyurtmalarim', '📊 Statistikam'],
        ['👤 Profilim', '⭐ Baholarim'],
        ['🌐 Usta panelga o\'tish'],
      );
    } else {
      keyboard.push(
        ['🔧 Usta qidirish', '📦 Buyurtmalarim'],
        ['📂 Kategoriyalar', '👤 Profilim'],
        ['➕ Buyurtma berish'],
      );
    }

    keyboard.push(['ℹ️ Yordam', '🔗 Saytga o\'tish']);

    await ctx.replyWithHTML(
      `🏠 <b>Asosiy menu</b>\n\n` +
      `${roleName} — ${user.name || 'Foydalanuvchi'}`,
      Markup.keyboard(keyboard).resize(),
    );
  }

  // ===== /help =====
  @Help()
  async onHelp(@Ctx() ctx: BotContext) {
    await ctx.replyWithHTML(
      `ℹ️ <b>Online Usta Bot — Yordam</b>\n\n` +
      `🤖 Bu bot orqali siz:\n\n` +
      `✅ Yangi buyurtmalar haqida xabar olasiz\n` +
      `✅ Buyurtma holatini kuzatasiz\n` +
      `✅ Statistikani ko'rasiz\n` +
      `✅ Usta qidirasiz\n` +
      `✅ Kategoriyalarni ko'rasiz\n\n` +
      `<b>Buyruqlar:</b>\n` +
      `/start — Botni ishga tushirish\n` +
      `/help — Yordam\n` +
      `/stats — Statistika\n` +
      `/orders — Buyurtmalar\n` +
      `/categories — Kategoriyalar\n` +
      `/profile — Profilim\n` +
      `/menu — Asosiy menu\n\n` +
      `🔗 Sayt: https://onlineusta.uz`,
    );
  }

  // ===== /menu =====
  @Command('menu')
  async onMenu(@Ctx() ctx: BotContext) {
    const chatId = ctx.chat.id.toString();
    const user = await this.botService.findUserByChatId(chatId);
    if (!user) {
      await this.onStart(ctx);
      return;
    }
    await this.showMainMenu(ctx, user);
  }

  // ===== /stats va 📊 Statistika =====
  @Command('stats')
  @Hears(/📊 Statistika(m)?/)
  async onStats(@Ctx() ctx: BotContext) {
    const chatId = ctx.chat.id.toString();
    const user = await this.botService.findUserByChatId(chatId);
    if (!user) { await this.onStart(ctx); return; }

    const stats = await this.botService.getStats();

    if (user.role === 'ADMIN') {
      await ctx.replyWithHTML(
        `📊 <b>Platforma statistikasi</b>\n\n` +
        `👥 Foydalanuvchilar: <b>${stats.usersCount}</b>\n` +
        `🔧 Ustalar: <b>${stats.mastersCount}</b>\n` +
        `📦 Jami buyurtmalar: <b>${stats.ordersCount}</b>\n` +
        `🔄 Faol buyurtmalar: <b>${stats.activeOrders}</b>\n\n` +
        `🔗 <a href="https://onlineusta.uz/admin">Admin panelga o'tish</a>`,
      );
    } else if (user.role === 'MASTER' && user.master) {
      await ctx.replyWithHTML(
        `📊 <b>Mening statistikam</b>\n\n` +
        `⭐ Reyting: <b>${user.master.rating?.toFixed(1) || '0.0'}</b>\n` +
        `📦 Jami buyurtmalar: <b>${user.master.totalOrders || 0}</b>\n` +
        `💬 Sharhlar: <b>${user.master.totalReviews || 0}</b>\n` +
        `💰 Jami daromad: <b>${(user.master.totalEarnings || 0).toLocaleString()} so'm</b>\n` +
        `📅 Oylik daromad: <b>${(user.master.monthlyEarnings || 0).toLocaleString()} so'm</b>\n\n` +
        `🔗 <a href="https://onlineusta.uz/master/stats">Batafsil ko'rish</a>`,
      );
    } else {
      await ctx.replyWithHTML(
        `📊 <b>Platforma haqida</b>\n\n` +
        `🔧 Ustalar soni: <b>${stats.mastersCount}</b>\n` +
        `📦 Jami buyurtmalar: <b>${stats.ordersCount}</b>\n\n` +
        `🔗 <a href="https://onlineusta.uz">Saytga o'tish</a>`,
      );
    }
  }

  // ===== /orders va 📦 Buyurtmalarim =====
  @Command('orders')
  @Hears(/📦 Buyurtmalar(im)?/)
  async onOrders(@Ctx() ctx: BotContext) {
    const chatId = ctx.chat.id.toString();
    const user = await this.botService.findUserByChatId(chatId);
    if (!user) { await this.onStart(ctx); return; }

    const orders = await this.botService.getUserOrders(user.id);

    if (orders.length === 0) {
      await ctx.replyWithHTML(
        `📦 <b>Buyurtmalar</b>\n\n` +
        `Hozircha buyurtmalar yo'q.\n\n` +
        `🔗 <a href="https://onlineusta.uz/orders/create">Yangi buyurtma berish</a>`,
      );
      return;
    }

    const statusEmoji: Record<string, string> = {
      PENDING: '⏳', ACCEPTED: '✅', IN_PROGRESS: '🔨',
      COMPLETED: '🎉', CANCELLED: '❌', CONTRACT_SENT: '📄',
      PAYMENT_PENDING: '💳', PAYMENT_DONE: '💰',
    };

    const statusLabel: Record<string, string> = {
      PENDING: 'Kutilmoqda', ACCEPTED: 'Qabul qilindi', IN_PROGRESS: 'Bajarilmoqda',
      COMPLETED: 'Tugallandi', CANCELLED: 'Bekor qilindi', CONTRACT_SENT: 'Shartnoma',
      PAYMENT_PENDING: 'To\'lov kutilmoqda', PAYMENT_DONE: 'To\'lov qilindi',
    };

    let text = `📦 <b>Oxirgi buyurtmalar</b>\n\n`;
    for (const order of orders) {
      const emoji = statusEmoji[order.status] || '📋';
      const status = statusLabel[order.status] || order.status;
      const date = new Date(order.createdAt).toLocaleDateString('uz');
      text += `${emoji} <b>${order.category?.icon || '📋'} ${order.category?.nameUz || 'Buyurtma'}</b>\n`;
      text += `   📅 ${date} — ${status}\n`;
      text += `   📍 ${order.address?.slice(0, 40) || '—'}\n\n`;
    }

    text += `🔗 <a href="https://onlineusta.uz/orders">Barcha buyurtmalar</a>`;

    await ctx.replyWithHTML(text);
  }

  // ===== /categories va 📂 Kategoriyalar =====
  @Command('categories')
  @Hears('📂 Kategoriyalar')
  async onCategories(@Ctx() ctx: BotContext) {
    const categories = await this.botService.getCategories();

    let text = `📂 <b>Xizmat kategoriyalari</b>\n\n`;
    for (const cat of categories) {
      text += `${cat.icon} ${cat.nameUz}\n`;
    }
    text += `\n🔗 <a href="https://onlineusta.uz/categories">Saytda ko'rish</a>`;

    await ctx.replyWithHTML(text);
  }

  // ===== /profile va 👤 Profilim =====
  @Command('profile')
  @Hears('👤 Profilim')
  async onProfile(@Ctx() ctx: BotContext) {
    const chatId = ctx.chat.id.toString();
    const user = await this.botService.findUserByChatId(chatId);
    if (!user) { await this.onStart(ctx); return; }

    const roleName = user.role === 'ADMIN' ? '👑 Admin' : user.role === 'MASTER' ? '🔧 Usta' : '👤 Foydalanuvchi';

    let text = `👤 <b>Mening profilim</b>\n\n` +
      `📛 <b>Ism:</b> ${user.name || '—'}\n` +
      `📱 <b>Telefon:</b> ${user.phone}\n` +
      `🏷️ <b>Rol:</b> ${roleName}\n` +
      `📍 <b>Manzil:</b> ${user.location || '—'}\n` +
      `📅 <b>Ro'yxatdan:</b> ${new Date(user.createdAt).toLocaleDateString('uz')}\n`;

    if (user.master) {
      text += `\n<b>🔧 Usta ma'lumotlari:</b>\n` +
        `📂 Kategoriya: ${user.master.category?.nameUz || '—'}\n` +
        `⭐ Reyting: ${user.master.rating?.toFixed(1) || '0.0'}\n` +
        `✅ Tasdiqlangan: ${user.master.isVerified ? 'Ha' : 'Yo\'q'}\n` +
        `🌐 Onlayn: ${user.master.isOnline ? 'Ha' : 'Yo\'q'}\n`;
    }

    text += `\n🔗 <a href="https://onlineusta.uz/profile">Profilni tahrirlash</a>`;

    await ctx.replyWithHTML(text);
  }

  // ===== 🔧 Usta qidirish =====
  @Hears('🔧 Usta qidirish')
  async onSearchMaster(@Ctx() ctx: BotContext) {
    const categories = await this.botService.getCategories();

    let text = `🔍 <b>Usta qidirish</b>\n\n` +
      `Quyidagi kategoriyalardan birini tanlang:\n\n`;

    for (const cat of categories) {
      text += `${cat.icon} ${cat.nameUz}\n`;
    }

    text += `\n🔗 <a href="https://onlineusta.uz/categories">Saytda qidirish</a>`;

    await ctx.replyWithHTML(text);
  }

  // ===== ➕ Buyurtma berish =====
  @Hears('➕ Buyurtma berish')
  async onCreateOrder(@Ctx() ctx: BotContext) {
    await ctx.replyWithHTML(
      `➕ <b>Yangi buyurtma berish</b>\n\n` +
      `Buyurtma berish uchun saytga o'ting:\n\n` +
      `🔗 <a href="https://onlineusta.uz/orders/create">Buyurtma yaratish</a>`,
      Markup.inlineKeyboard([
        [Markup.button.url('🌐 Buyurtma berish', 'https://onlineusta.uz/orders/create')],
      ]),
    );
  }

  // ===== 🌐 Saytga o'tish =====
  @Hears(/🌐 Saytga o'tish|🔗 Saytga o'tish/)
  async onGoToSite(@Ctx() ctx: BotContext) {
    await ctx.replyWithHTML(
      `🌐 <b>Online Usta</b> sayti:\n\n` +
      `🔗 https://onlineusta.uz`,
      Markup.inlineKeyboard([
        [Markup.button.url('🌐 Saytga o\'tish', 'https://onlineusta.uz')],
      ]),
    );
  }

  // ===== ⚙️ Admin panel =====
  @Hears('⚙️ Admin panel')
  async onAdminPanel(@Ctx() ctx: BotContext) {
    const chatId = ctx.chat.id.toString();
    const user = await this.botService.findUserByChatId(chatId);
    if (!user || user.role !== 'ADMIN') {
      await ctx.reply('❌ Sizda admin huquqi yo\'q');
      return;
    }

    await ctx.replyWithHTML(
      `⚙️ <b>Admin panel</b>\n\n` +
      `🔗 <a href="https://onlineusta.uz/admin">Admin panelga o'tish</a>`,
      Markup.inlineKeyboard([
        [Markup.button.url('⚙️ Admin panel', 'https://onlineusta.uz/admin')],
      ]),
    );
  }

  // ===== 🌐 Usta panelga o'tish =====
  @Hears(/🌐 Usta panelga o'tish/)
  async onMasterPanel(@Ctx() ctx: BotContext) {
    await ctx.replyWithHTML(
      `🔧 <b>Usta paneli</b>\n\n` +
      `🔗 <a href="https://onlineusta.uz/master">Usta panelga o'tish</a>`,
      Markup.inlineKeyboard([
        [Markup.button.url('🔧 Usta panel', 'https://onlineusta.uz/master')],
      ]),
    );
  }

  // ===== 👥 Foydalanuvchilar (admin) =====
  @Hears('👥 Foydalanuvchilar')
  async onUsers(@Ctx() ctx: BotContext) {
    const chatId = ctx.chat.id.toString();
    const user = await this.botService.findUserByChatId(chatId);
    if (!user || user.role !== 'ADMIN') return;

    const total = await this.botService.getStats();
    await ctx.replyWithHTML(
      `👥 <b>Foydalanuvchilar</b>\n\n` +
      `Jami: <b>${total.usersCount}</b> ta\n\n` +
      `🔗 <a href="https://onlineusta.uz/admin/users">Barchasini ko'rish</a>`,
      Markup.inlineKeyboard([
        [Markup.button.url('👥 Foydalanuvchilar', 'https://onlineusta.uz/admin/users')],
      ]),
    );
  }

  // ===== 🔧 Ustalar (admin) =====
  @Hears('🔧 Ustalar')
  async onMasters(@Ctx() ctx: BotContext) {
    const chatId = ctx.chat.id.toString();
    const user = await this.botService.findUserByChatId(chatId);
    if (!user || user.role !== 'ADMIN') return;

    const total = await this.botService.getStats();
    await ctx.replyWithHTML(
      `🔧 <b>Ustalar</b>\n\n` +
      `Jami: <b>${total.mastersCount}</b> ta\n\n` +
      `🔗 <a href="https://onlineusta.uz/admin/masters">Barchasini ko'rish</a>`,
      Markup.inlineKeyboard([
        [Markup.button.url('🔧 Ustalar', 'https://onlineusta.uz/admin/masters')],
      ]),
    );
  }

  // ===== ⭐ Baholarim =====
  @Hears('⭐ Baholarim')
  async onMyReviews(@Ctx() ctx: BotContext) {
    const chatId = ctx.chat.id.toString();
    const user = await this.botService.findUserByChatId(chatId);
    if (!user || !user.master) {
      await ctx.reply('Bu funksiya faqat ustalar uchun');
      return;
    }

    await ctx.replyWithHTML(
      `⭐ <b>Baholar va sharhlar</b>\n\n` +
      `⭐ Reyting: <b>${user.master.rating?.toFixed(1) || '0.0'}</b>\n` +
      `💬 Sharhlar soni: <b>${user.master.totalReviews || 0}</b>\n\n` +
      `🔗 <a href="https://onlineusta.uz/master/stats">Batafsil ko'rish</a>`,
    );
  }

  // ===== ℹ️ Yordam =====
  @Hears('ℹ️ Yordam')
  async onHelpButton(@Ctx() ctx: BotContext) {
    await this.onHelp(ctx);
  }
}

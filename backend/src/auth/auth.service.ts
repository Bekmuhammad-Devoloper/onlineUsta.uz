import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private smsService: SmsService,
    private config: ConfigService,
  ) {}

  async sendOtp(phone: string) {
    // Validate phone format
    if (!phone.match(/^\+998\d{9}$/)) {
      throw new BadRequestException('Telefon raqami +998XXXXXXXXX formatda bo\'lishi kerak');
    }

    // Check if there's a recent blocked OTP
    const existingOtp = await this.prisma.otpCode.findFirst({
      where: {
        phone,
        isBlocked: true,
        blockedUntil: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (existingOtp) {
      const remainingMinutes = Math.ceil(
        (existingOtp.blockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new BadRequestException(
        `Juda ko'p urinish. ${remainingMinutes} daqiqadan keyin qayta urinib ko'ring`,
      );
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (3 minutes per TZ)
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() +
        this.config.get<number>('OTP_EXPIRATION_MINUTES', 3),
    );

    // Create OTP record
    await this.prisma.otpCode.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });

    // Send SMS — text must match Eskiz approved template exactly
    await this.smsService.sendSms(
      phone,
      `Assalomu alaykum va rahmatullahi barakatuh. Online Usta ilovasi uchun tasdiqlash kodi: ${code}`,
    );

    // In development, return code in response for easy testing
    const isDev = this.config.get('NODE_ENV') !== 'production';
    return {
      message: 'Tasdiqlash kodi yuborildi',
      expiresIn: this.config.get<number>('OTP_EXPIRATION_MINUTES', 3),
      ...(isDev && { code }),
    };
  }

  async verifyOtp(phone: string, code: string, deviceId?: string, fcmToken?: string) {
    // Find the latest OTP for this phone
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phone,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP topilmadi yoki allaqachon ishlatilgan');
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP muddati tugagan');
    }

    // Check if OTP is blocked
    if (otpRecord.isBlocked) {
      throw new BadRequestException('Ko\'p urinish tufayli bloklangan');
    }

    // Verify the code
    if (otpRecord.code !== code) {
      // Increment attempts
      const attempts = otpRecord.attempts + 1;
      const maxAttempts = this.config.get<number>('OTP_MAX_ATTEMPTS', 3);

      // Block if max attempts reached (15 min block per TZ)
      if (attempts >= maxAttempts) {
        const blockDuration = this.config.get<number>(
          'OTP_BLOCK_DURATION_MINUTES',
          15,
        );
        const blockedUntil = new Date();
        blockedUntil.setMinutes(blockedUntil.getMinutes() + blockDuration);

        await this.prisma.otpCode.update({
          where: { id: otpRecord.id },
          data: {
            attempts,
            isBlocked: true,
            blockedUntil,
          },
        });

        throw new BadRequestException(
          `Ko'p noto'g'ri urinish. ${blockDuration} daqiqa bloklandi`,
        );
      }

      // Update attempts
      await this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts },
      });

      throw new UnauthorizedException(
        `Noto'g'ri kod. ${maxAttempts - attempts} ta urinish qoldi`,
      );
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone },
      include: {
        master: true,
      },
    });

    const isNewUser = !user;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          name: 'User', // Will be updated during registration
          role: 'USER',
        },
        include: {
          master: true,
        },
      });
    }

    // Check if user is blocked
    if (user.status === 'BLOCKED') {
      throw new ForbiddenException('Hisobingiz bloklangan. Admin bilan bog\'laning');
    }

    // Device check for masters (bitta qurilma cheklovi)
    if (user.master && user.master.deviceId && deviceId && user.master.deviceId !== deviceId) {
      throw new ForbiddenException(
        'Boshqa qurilmadan kirish taqiqlangan. Qurilmani o\'zgartirish uchun admin bilan bog\'laning',
      );
    }

    // Update last login, device info, fcm token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        deviceId: deviceId || user.deviceId,
        fcmToken: fcmToken || user.fcmToken,
      },
    });

    // Update master device if applicable
    if (user.master && deviceId) {
      await this.prisma.master.update({
        where: { id: user.master.id },
        data: { deviceId },
      });
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });

    return {
      token,
      isNewUser,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        location: user.location,
        avatar: user.avatar,
        isMaster: !!user.master,
        isVerifiedMaster: user.master?.isVerified || false,
      },
    };
  }

  async register(userId: string, name: string, location?: string, latitude?: number, longitude?: number, birthYear?: number) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name,
        location,
        latitude,
        longitude,
        birthYear,
      },
      include: {
        master: true,
      },
    });

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      location: user.location,
      avatar: user.avatar,
      isMaster: !!user.master,
      isVerifiedMaster: user.master?.isVerified || false,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        fcmToken: null,
      },
    });

    // Set master offline if applicable
    const master = await this.prisma.master.findUnique({
      where: { userId },
    });

    if (master) {
      await this.prisma.master.update({
        where: { id: master.id },
        data: { isOnline: false },
      });
    }

    return { message: 'Muvaffaqiyatli chiqildi' };
  }
}

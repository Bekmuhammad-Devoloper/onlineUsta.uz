import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private token: string;

  constructor(private config: ConfigService) {}

  async sendSms(phone: string, message: string): Promise<void> {
    // Always log OTP in development for testing
    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.warn(`📱 [DEV] SMS to ${phone}: ${message}`);
    }

    try {
      const provider = this.config.get<string>('SMS_PROVIDER', 'eskiz');

      if (provider === 'eskiz') {
        await this.sendViaEskiz(phone, message);
      } else {
        this.logger.warn(`SMS provider ${provider} not implemented. Logging message instead.`);
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      // In development, we don't throw error — OTP is logged to console
      if (this.config.get('NODE_ENV') === 'production') {
        throw error;
      }
    }
  }

  private async sendViaEskiz(phone: string, message: string): Promise<void> {
    const apiUrl = this.config.get<string>('SMS_API_URL');
    
    // Get or refresh token
    if (!this.token) {
      await this.getEskizToken();
    }

    try {
      await axios.post(
        `${apiUrl}/message/sms/send`,
        {
          mobile_phone: phone.replace('+', ''),
          message,
          from: '4546',
          callback_url: '',
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );

      this.logger.log(`SMS sent successfully to ${phone}`);
    } catch (error) {
      // If token expired, refresh and retry
      if (error.response?.status === 401) {
        await this.getEskizToken();
        return this.sendViaEskiz(phone, message);
      }
      throw error;
    }
  }

  private async getEskizToken(): Promise<void> {
    const apiUrl = this.config.get<string>('SMS_API_URL');
    const email = this.config.get<string>('SMS_EMAIL');
    const password = this.config.get<string>('SMS_PASSWORD');

    const response = await axios.post(`${apiUrl}/auth/login`, {
      email,
      password,
    });

    this.token = response.data.data.token;
  }
}

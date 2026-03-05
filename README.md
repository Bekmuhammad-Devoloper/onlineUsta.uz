# Online Usta Platform

**Versiya**: 1.0  
**Sana**: 2026

## Loyiha haqida

Online Usta — uy-ro'zg'or, qurilish, ta'mirlash va boshqa sohalardagi ustalarni buyurtmachilar bilan bog'lovchi raqamli platforma.

## Texnologiyalar

### Backend
- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Auth**: JWT + SMS OTP
- **Payment**: Payme, Click
- **SMS**: Eskiz
- **Storage**: AWS S3

### Frontend (Mobile)
- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **State**: Zustand
- **UI**: React Native Paper

## Loyiha strukturasi

```
Online Usta/
├── backend/              # NestJS API server
│   ├── prisma/          # Database schema & migrations
│   ├── src/             # Source code
│   │   ├── auth/       # Authentication module
│   │   ├── orders/     # Orders management
│   │   ├── masters/    # Masters management
│   │   ├── payments/   # Payment integration
│   │   ├── admin/      # Admin panel API
│   │   └── ...
│   ├── docker-compose.yml
│   └── README.md
│
├── frontend/            # React Native mobile app
│   ├── src/
│   │   ├── screens/    # App screens
│   │   ├── navigation/ # Navigation setup
│   │   ├── services/   # API services
│   │   └── store/      # State management
│   └── README.md
│
└── README.md            # This file
```

## Boshlash

### Backend ishga tushirish

1. Backend papkasiga o'tish:
```bash
cd backend
```

2. Kerakli paketlarni o'rnatish:
```bash
npm install
```

3. `.env` faylni sozlash:
```bash
copy .env.example .env
```

4. Dockerda ishga tushirish:
```bash
docker-compose up -d
```

5. Database migratsiya:
```bash
npm run prisma:migrate
npm run prisma:seed
```

6. Serverni ishga tushirish:
```bash
npm run start:dev
```

Backend: http://localhost:3000  
API Docs: http://localhost:3000/api/docs

### Frontend ishga tushirish

1. Frontend papkasiga o'tish:
```bash
cd frontend
```

2. Paketlarni o'rnatish:
```bash
npm install
```

3. API URL sozlash (`src/services/api.ts`):
```typescript
const API_URL = 'http://localhost:3000';
```

4. Ilovani ishga tushirish:
```bash
npm start
```

Keyin:
- `i` - iOS simulator
- `a` - Android emulator
- QR kod - Real qurilma (Expo Go app)

## Asosiy imkoniyatlar

### Foydalanuvchi uchun
- ✅ Telefon + OTP orqali kirish
- ✅ Xizmat kategoriyalarini ko'rish
- ✅ Ustalarni ko'rish va tanlash
- ✅ Buyurtma berish
- ✅ To'lov qilish (Payme/Click/Naqd)
- ✅ Buyurtma holatini kuzatish
- ✅ Xizmatlarni baholash

### Usta uchun
- ✅ Usta sifatida ro'yxatdan o'tish
- ✅ Yangi buyurtmalarni ko'rish
- ✅ Buyurtmani qabul qilish
- ✅ Shartnoma yuborish (narx belgilash)
- ✅ Ish holatini yangilash
- ✅ Daromadni kuzatish
- ✅ Obuna tanlash

### Admin uchun
- ✅ Dashboard va statistika
- ✅ Ustalarni tasdiqlash
- ✅ Buyurtmalarni boshqarish
- ✅ Shikoyatlarni ko'rish
- ✅ Narxlarni belgilash
- ✅ Geolokatsiyani kuzatish

## API Endpoints

### Auth
- `POST /auth/send-otp` - OTP yuborish
- `POST /auth/verify-otp` - OTP tasdiqlash
- `POST /auth/register` - Ro'yxatdan o'tish

### Orders
- `POST /orders` - Buyurtma yaratish
- `GET /orders` - Buyurtmalar ro'yxati
- `PATCH /orders/:id/accept` - Qabul qilish
- `PATCH /orders/:id/contract` - Shartnoma yuborish
- `PATCH /orders/:id/complete` - Tugatish

### Masters
- `GET /masters` - Ustalar ro'yxati
- `POST /masters/register` - Usta ro'yxatdan o'tish
- `PATCH /masters/subscription` - Obuna yangilash

### Payments
- `POST /payments/initiate` - To'lovni boshlash
- `POST /payments/cash-confirm` - Naqd to'lov tasdiqlash

### Admin
- `GET /admin/dashboard` - Dashboard
- `PATCH /admin/masters/:id/verify` - Usta tasdiqlash
- `GET /admin/complaints` - Shikoyatlar

## To'lov tizimi

Platform 12% komissiya olinadi:
- Foydalanuvchi 100,000 so'm to'laydi
- Platform: 12,000 so'm
- Usta: 88,000 so'm (24 soat ichida)

## Xavfsizlik

- ✅ JWT token autentifikatsiya
- ✅ SMS OTP (3 urinish, 15 daqiqa blok)
- ✅ Passport ma'lumotlari shifrlangan
- ✅ HTTPS majburiy
- ✅ Rate limiting

## Development

Backend development:
```bash
cd backend
npm run start:dev
```

Frontend development:
```bash
cd frontend
npm start
```

## Production

### Backend deploy:
```bash
cd backend
npm run build
docker-compose up -d
```

### Mobile app build:
```bash
cd frontend
eas build --platform android
eas build --platform ios
```

## Muhim Eslatmalar

1. **Environment Variables**: `.env` fayllarini production uchun to'liq sozlang
2. **SMS Service**: Eskiz yoki Play Mobile hisob ochish kerak
3. **Payment**: Payme va Click test/production kalitlarini olish
4. **Database**: Production uchun PostgreSQL backup sozlang
5. **Push Notifications**: FCM Server Key olish kerak

## Murojaat

Qo'shimcha ma'lumot yoki yordam uchun:
- Email: support@onlineusta.uz
- Telegram: @onlineusta

## Litsenziya

MIT License - batafsil ma'lumot uchun LICENSE faylini ko'ring.

---

**Online Usta Team © 2026**

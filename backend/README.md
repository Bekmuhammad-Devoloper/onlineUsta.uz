# Online Usta - Backend API

## Tech Stack
- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Authentication**: JWT + SMS OTP
- **Payment**: Payme, Click API
- **SMS**: Eskiz / Play Mobile
- **File Storage**: AWS S3 / MinIO

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Installation

1. Clone the repository and navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure:
```bash
copy .env.example .env
```

4. Update `.env` with your credentials:
- Database connection string
- JWT secret
- SMS provider credentials
- Payment gateway credentials
- AWS S3 credentials

### Database Setup

1. Generate Prisma client:
```bash
npm run prisma:generate
```

2. Run migrations:
```bash
npm run prisma:migrate
```

3. Seed database with initial data:
```bash
npm run prisma:seed
```

4. (Optional) Open Prisma Studio to view data:
```bash
npm run prisma:studio
```

### Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

### Docker Setup

Run with Docker Compose:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3000

## API Documentation

Once running, visit: http://localhost:3000/api/docs

This provides interactive Swagger documentation for all endpoints.

## Main Endpoints

### Authentication
- `POST /auth/send-otp` - Send OTP code
- `POST /auth/verify-otp` - Verify OTP and login
- `POST /auth/register` - Complete registration

### Users
- `GET /users/profile` - Get current user profile
- `PATCH /users/profile` - Update profile
- `GET /users/orders` - Get order history

### Masters
- `GET /masters` - Get all verified masters
- `GET /masters/:id` - Get master profile
- `POST /masters/register` - Register as master
- `PATCH /masters/subscription` - Update subscription

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id/accept` - Master accepts order
- `PATCH /orders/:id/contract` - Send contract with price
- `PATCH /orders/:id/start` - Start work
- `PATCH /orders/:id/complete` - Complete work
- `PATCH /orders/:id/cancel` - Cancel order
- `POST /orders/:id/review` - Add review

### Payments
- `POST /payments/initiate` - Initiate online payment
- `POST /payments/callback/:type` - Payment gateway callback
- `POST /payments/cash-confirm` - Confirm cash payment
- `GET /payments/history` - Get payment history

### Admin
- `GET /admin/dashboard` - Dashboard statistics
- `PATCH /admin/masters/:id/verify` - Verify master
- `PATCH /admin/users/:id/block` - Block user
- `PATCH /admin/orders/:id/assign` - Assign order to master
- `GET /admin/complaints` - Get all complaints
- `GET /admin/settings` - Get platform settings

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── admin/             # Admin module
│   ├── auth/              # Authentication & OTP
│   ├── masters/           # Masters management
│   ├── notifications/     # Push notifications
│   ├── orders/            # Order management
│   ├── payments/          # Payment integration
│   ├── prisma/            # Prisma service
│   ├── sms/               # SMS service
│   ├── upload/            # File upload
│   ├── users/             # User management
│   ├── app.module.ts      # Main app module
│   └── main.ts            # Application entry
├── .env.example           # Environment template
├── docker-compose.yml     # Docker configuration
├── Dockerfile             # Docker image
└── package.json           # Dependencies
```

## Environment Variables

See `.env.example` for all required environment variables.

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

MIT

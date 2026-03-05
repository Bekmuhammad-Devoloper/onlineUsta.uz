-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "tariffId" TEXT;

-- CreateTable
CREATE TABLE "tariffs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SubscriptionType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tariffs_pkey" PRIMARY KEY ("id")
);

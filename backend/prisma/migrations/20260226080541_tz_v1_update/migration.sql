-- CreateEnum
CREATE TYPE "DeviceChangeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'SYSTEM_MESSAGE';

-- AlterTable
ALTER TABLE "masters" ADD COLUMN     "passportPhotoBack" TEXT,
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "contractDescription" TEXT,
ADD COLUMN     "isFreelance" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fcmToken" TEXT;

-- CreateTable
CREATE TABLE "device_change_requests" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "oldDeviceId" TEXT,
    "newDeviceId" TEXT NOT NULL,
    "status" "DeviceChangeStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_change_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "device_change_requests" ADD CONSTRAINT "device_change_requests_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

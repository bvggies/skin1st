-- AlterTable: add Order columns expected by Prisma schema (trackingCode, guestEmail, estimatedDelivery, deliveredAt)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guestEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "estimatedDelivery" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);

-- CreateUniqueIndex (trackingCode is optional but unique when set)
CREATE UNIQUE INDEX IF NOT EXISTS "Order_trackingCode_key" ON "Order"("trackingCode");

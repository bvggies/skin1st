-- AlterTable
ALTER TABLE "EventTracking" ADD COLUMN     "orderId" TEXT;

-- AddForeignKey
ALTER TABLE "EventTracking" ADD CONSTRAINT "EventTracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

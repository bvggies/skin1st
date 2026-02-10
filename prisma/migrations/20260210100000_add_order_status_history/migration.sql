-- CreateTable: OrderStatusHistory (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'OrderStatusHistory') THEN
        CREATE TABLE "OrderStatusHistory" (
            "id" TEXT NOT NULL,
            "orderId" TEXT NOT NULL,
            "status" "OrderStatus" NOT NULL,
            "note" TEXT,
            "location" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
        );

        CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");

        ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" 
            FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

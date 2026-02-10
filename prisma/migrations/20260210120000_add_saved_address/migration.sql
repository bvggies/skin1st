-- CreateTable: SavedAddress
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'SavedAddress') THEN
        CREATE TABLE "SavedAddress" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "label" TEXT NOT NULL,
            "isDefault" BOOLEAN NOT NULL DEFAULT false,
            "recipientName" TEXT NOT NULL,
            "phone" TEXT NOT NULL,
            "alternativePhone" TEXT,
            "region" TEXT NOT NULL,
            "city" TEXT NOT NULL,
            "area" TEXT,
            "landmark" TEXT,
            "fullAddress" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "SavedAddress_pkey" PRIMARY KEY ("id")
        );

        CREATE INDEX "SavedAddress_userId_idx" ON "SavedAddress"("userId");

        ALTER TABLE "SavedAddress" ADD CONSTRAINT "SavedAddress_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

/*
  Warnings:

  - A unique constraint covering the columns `[cartToken]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "cartToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_cartToken_key" ON "Cart"("cartToken");

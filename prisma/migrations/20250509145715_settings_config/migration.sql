/*
  Warnings:

  - You are about to drop the column `maxTradeAmount` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `notifications` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "maxTradeAmount",
DROP COLUMN "notifications",
ADD COLUMN     "gasPriority" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "proMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slippage" TEXT NOT NULL DEFAULT '1';

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "encryptedPrivateKey" TEXT;

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

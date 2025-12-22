/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredById" TEXT;

-- CreateTable
CREATE TABLE "ReferralStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralStats_userId_key" ON "ReferralStats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralStats" ADD CONSTRAINT "ReferralStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

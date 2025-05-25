/*
  Warnings:

  - You are about to drop the column `encryptedPrivateKey` on the `Wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "encryptedPrivateKey";

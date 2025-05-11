/*
  Warnings:

  - You are about to drop the column `acceptedTerms` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "acceptedTerms",
ADD COLUMN     "termsAccepted" BOOLEAN NOT NULL DEFAULT false;

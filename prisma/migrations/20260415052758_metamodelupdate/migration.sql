/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `MetaAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `MetaAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MetaAccount" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MetaAccount_userId_key" ON "MetaAccount"("userId");

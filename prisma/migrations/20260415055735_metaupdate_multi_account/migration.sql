/*
  Warnings:

  - A unique constraint covering the columns `[userId,accountId]` on the table `MetaAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `MetaAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MetaAccount_userId_key";

-- AlterTable
ALTER TABLE "MetaAccount" ADD COLUMN     "accountId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MetaAccount_userId_accountId_key" ON "MetaAccount"("userId", "accountId");

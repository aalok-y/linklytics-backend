/*
  Warnings:

  - You are about to drop the column `clicks` on the `Analytics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Analytics" DROP COLUMN "clicks";

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "clicks" INTEGER NOT NULL DEFAULT 0;

/*
  Warnings:

  - A unique constraint covering the columns `[endpoint]` on the table `Portfolio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endpoint` to the `Portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "endpoint" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_endpoint_key" ON "Portfolio"("endpoint");

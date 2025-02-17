/*
  Warnings:

  - A unique constraint covering the columns `[linkId,portfolioLinkId]` on the table `Analytics` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Analytics" ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "deviceType" DROP NOT NULL,
ALTER COLUMN "browser" DROP NOT NULL,
ALTER COLUMN "os" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_linkId_portfolioLinkId_key" ON "Analytics"("linkId", "portfolioLinkId");

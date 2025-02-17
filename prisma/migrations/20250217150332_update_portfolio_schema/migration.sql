/*
  Warnings:

  - You are about to drop the column `portfolioId` on the `Link` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_linkId_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_portfolioId_fkey";

-- AlterTable
ALTER TABLE "Analytics" ADD COLUMN     "portfolioLinkId" INTEGER,
ALTER COLUMN "linkId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "portfolioId";

-- CreateTable
CREATE TABLE "PortfolioLink" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'link',
    "portfolioId" INTEGER NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "shortUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PortfolioLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioLink_shortUrl_key" ON "PortfolioLink"("shortUrl");

-- AddForeignKey
ALTER TABLE "PortfolioLink" ADD CONSTRAINT "PortfolioLink_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_portfolioLinkId_fkey" FOREIGN KEY ("portfolioLinkId") REFERENCES "PortfolioLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

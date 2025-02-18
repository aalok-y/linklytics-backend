-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "PortfolioLink" DROP CONSTRAINT "PortfolioLink_portfolioId_fkey";

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioLink" ADD CONSTRAINT "PortfolioLink_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

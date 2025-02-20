import { prismaClient } from "..";
import { Request, Response } from "express";


export const getAnalytics = async (req: Request, res: Response) => {
  const linkId = parseInt(req.params.linkId);

  try {
      // First check if the link exists
      const link = await prismaClient.link.findUnique({
          where: { id: linkId }
      });

      if (!link) {
          res.status(404).json({ message: 'Link not found' });
          return;
      }

      // Fetch analytics data for the link
      const analytics = await prismaClient.analytics.findMany({
          where: { linkId: linkId },
          orderBy: { lastAccessed: 'desc' }
      });

      if (analytics.length === 0) {
          res.status(204).json({
              message: 'No analytics recorded yet for this link'
          });
          return;
      }

      res.status(200).json({
          message: 'Analytics fetched successfully',
          analytics: analytics
      });
  } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Error fetching analytics data' });
  }
}


export const getPortfolioLinkAnalytics = async (req: Request, res: Response) => {
  const linkId = parseInt(req.params.linkId);
  
  try {
      // First check if the portfolio link exists
      const portfolioLink = await prismaClient.portfolioLink.findUnique({
          where: { id: linkId }
      });

      if (!portfolioLink) {
          res.status(404).json({ message: 'Portfolio link not found' });
          return
      }

      // Fetch analytics data for the portfolio link
      const analytics = await prismaClient.analytics.findMany({
          where: { portfolioLinkId: linkId },
          orderBy: { lastAccessed: 'desc' }
      });

      if (analytics.length === 0) {
          res.status(204).json({
              message: 'No analytics recorded yet for this portfolio link'
          });
          return;
      }

      res.status(200).json({
          message: 'Portfolio link analytics fetched successfully',
          analytics: analytics
      });
  } catch (error) {
      console.error('Error fetching portfolio link analytics:', error);
      res.status(500).json({ message: 'Error fetching analytics data' });
  }
}
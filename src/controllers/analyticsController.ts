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

export const getAllCampaignAnalytics = async (req: Request, res: Response) => {
  try {
    // Fetch all campaigns with their links
    const campaigns = await prismaClient.campaign.findMany({
      include: {
        links: true
      }
    });

    // Fetch analytics for all links
    const analytics = await prismaClient.analytics.findMany({
      where: {
        linkId: {
          in: campaigns.flatMap(campaign => campaign.links.map(link => link.id))
        }
      },
      orderBy: { lastAccessed: 'desc' },
      include: {
        link: {
          include: {
            campaign: true
          }
        }
      }
    });

    if (analytics.length === 0) {
      res.status(204).json({
        message: 'No analytics recorded yet for any campaigns'
      });
      return;
    }

    res.status(200).json({
      message: 'Campaign analytics fetched successfully',
      analytics: analytics
    });
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
}

export const getAllPortfolioLinkAnalytics = async (req: Request, res: Response) => {
  try {
    // Fetch all portfolios with their links
    const portfolios = await prismaClient.portfolio.findMany({
      include: {
        portfolioLinks: true
      }
    });

    // Fetch analytics for all portfolio links
    const analytics = await prismaClient.analytics.findMany({
      where: {
        portfolioLinkId: {
          in: portfolios.flatMap(portfolio => portfolio.portfolioLinks.map(link => link.id))
        }
      },
      orderBy: { lastAccessed: 'desc' },
      include: {
        portfolioLink: {
          include: {
            portfolio: true
          }
        }
      }
    });

    if (analytics.length === 0) {
      res.status(204).json({
        message: 'No analytics recorded yet for any portfolio links'
      });
      return;
    }

    // Group analytics by portfolio
    const analyticsGroupedByPortfolio = portfolios.map(portfolio => ({
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      analytics: analytics.filter(a => a.portfolioLink?.portfolioId === portfolio.id)
    }));

    res.status(200).json({
      message: 'Portfolio analytics fetched successfully',
      analytics: analyticsGroupedByPortfolio
    });
  } catch (error) {
    console.error('Error fetching portfolio analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
}

export const getAllPortfolioAnalytics = async (req: Request, res: Response) => {
  try {
    // Fetch all portfolios with their analytics
    const portfolios = await prismaClient.portfolio.findMany({
      include: {
        portfolioLinks: {
          include: {
            analytics: true
          }
        }
      }
    });

    if (!portfolios.length) {
      res.status(204).json({
        message: 'No portfolios found'
      });
      return;
    }

    // Transform the data into the required format
    const analytics = portfolios.map(portfolio => ({
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      analytics: portfolio.portfolioLinks.flatMap(link => link.analytics)
    }));

    res.status(200).json({
      message: 'Portfolio analytics fetched successfully',
      analytics: analytics
    });
  } catch (error) {
    console.error('Error fetching portfolio analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
}
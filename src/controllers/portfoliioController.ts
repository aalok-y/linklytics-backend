import { Request, Response } from "express"
import {createPortfolioSchema} from "../types/types"
import { prismaClient } from "../index"; 
import { nanoid } from "nanoid";


export const createPortfolio = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId; 
  
      const parsedData = createPortfolioSchema.parse(req.body);
  
      const portfolio = await prismaClient.portfolio.create({
        data: {
          name: parsedData.portName,
          description: parsedData.description,
          userId: userId,
        },
      });
  
      if (parsedData.links && parsedData.links.length > 0) {
        const portfolioLinks = parsedData.links.map((link) => ({
          name: link.name,
          originalUrl: link.link,
          shortUrl: nanoid(6),
          portfolioId: portfolio.id,
        }));
  
        // Bulk create portfolio links
        await prismaClient.portfolioLink.createMany({
          data: portfolioLinks,
        });
      }
  
      res.status(201).json({
        message: "Portfolio created successfully",
        portfolioId: portfolio.id,
      });
    } catch (error) {
      console.error("Error creating portfolio:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
  };


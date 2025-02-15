import { Request, Response } from "express";

export const linkNotFound = (req: Request, res: Response) => {
  res.status(400).json({
    message: "Short link not found",
  });

  return;
};

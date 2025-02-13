import { log } from "console";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from `Authorization` header

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "Super-Secret"
    ) as JwtPayload;
    console.log("decoded userid ", decoded);

    req.userId = decoded.userId;
    console.log("Userid from middleware: ", req.userId);

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token or not Authorized" });
  }
};

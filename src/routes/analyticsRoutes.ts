import { Router } from "express";
import { trackLinkMiddleware } from "../controllers/analyticsController";
import { Request, Response } from "express";

const router = Router();

const hello = (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello",
  });
};

router.get("/test", trackLinkMiddleware, hello);


export default router;
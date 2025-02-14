import { Router } from "express";
import { Request, Response } from "express";
import { trackLinkMiddleware } from "../middlewares/analyticsMiddleware";


const router = Router();

const hello = (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello",
  });
};

router.get("/test/:shortUrl", trackLinkMiddleware, hello);


export default router;
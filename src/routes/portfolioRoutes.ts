import { Router } from "express";
import { createPortfolio } from "../controllers/portfoliioController";

const router = Router();

router.post('/portfolio',createPortfolio);

export default router;
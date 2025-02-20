import { Router } from "express";
import { getAnalytics, getPortfolioLinkAnalytics } from "../controllers/analyticsController";


const router = Router();

router.get('/analytics/:linkId',getAnalytics);
router.get('/portfolio/analytics/:linkId',getPortfolioLinkAnalytics)
export default router;
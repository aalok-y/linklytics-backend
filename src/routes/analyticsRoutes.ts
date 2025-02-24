import { Router } from "express";
import { getAnalytics, getPortfolioLinkAnalytics, getAllCampaignAnalytics, getAllPortfolioLinkAnalytics, getAllPortfolioAnalytics } from "../controllers/analyticsController";


const router = Router();

router.get('/analytics/:linkId',getAnalytics);
router.get('/campaigns/analytics', getAllCampaignAnalytics);
router.get('/portfolio/analytics/:linkId',getPortfolioLinkAnalytics)
// router.get('/portfolios/analytics', getAllPortfolioAnalytics)
router.get('/portfolios/analytics', getAllPortfolioLinkAnalytics)
export default router;
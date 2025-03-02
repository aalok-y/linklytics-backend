import express, { Router } from "express"
import { visitPortfolio } from "../controllers/portfoliioController";
import { trackLinkMiddleware } from "../middlewares/analyticsMiddleware";
import { visitLink } from "../controllers/linkController";

const router = Router();

router.get('/p/:endpoint',visitPortfolio);
router.get('/:shortUrl', trackLinkMiddleware, visitLink);

export default router;
import { Router } from "express";
import { createPortfolio, deletePortfolio, getPortfolio, getAllPortfolio, updatePortfolio, visitPortfolio } from "../controllers/portfoliioController";

const router = Router();

router.post('/portfolio',createPortfolio);
router.put('/portfolio/:id',updatePortfolio);
router.delete('/portfolio/:id',deletePortfolio);
router.get('/portfolio/:id',getPortfolio);
router.get('/portfolio',getAllPortfolio);
router.get('/p/:endpoint',visitPortfolio)
export default router;
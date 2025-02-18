import { Router } from "express";
import { createPortfolio, deletePortfolio, getPortfolio, updatePortfolio } from "../controllers/portfoliioController";

const router = Router();

router.post('/portfolio',createPortfolio);
router.put('/portfolio/:id',updatePortfolio);
router.delete('/portfolio/:id',deletePortfolio);
router.get('/portfolio/:id',getPortfolio);

export default router;
import { Router } from "express";
import { createPortfolio, deletePortfolio, updatePortfolio } from "../controllers/portfoliioController";

const router = Router();

router.post('/portfolio',createPortfolio);
router.put('/portfolio/:id',updatePortfolio);
router.delete('/portfolio/:id',deletePortfolio);

export default router;
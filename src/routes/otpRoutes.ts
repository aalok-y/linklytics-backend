import Router from "express"
import { verifyEmail, verifyEmailOTP } from "../controllers/authController";

const router = Router()

router.post('/verifyemail', verifyEmail);
router.post('/verifyotp', verifyEmailOTP);
export default router
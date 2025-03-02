import Router from "express"
import { verifyEmailOTP, sendOTP } from "../controllers/authController";

const router = Router()


router.post('/verifyotp', verifyEmailOTP);
router.get('/sendotp/:email/:otp',sendOTP)
export default router
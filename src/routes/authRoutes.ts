import { Router } from "express";
import {signup, signin, updatePassword, sendResetPasswordLink, sendResetPasswordTemplate} from "../controllers/authController"

const router = Router();

router.post('/auth/signup',signup);
router.post('/auth/signin',signin);
router.get('/auth/update-password',updatePassword)
router.get('/auth/send-reset-password-link/:email',sendResetPasswordLink)
router.get('/auth/send-reset-password-template/:email', sendResetPasswordTemplate)

export default router;
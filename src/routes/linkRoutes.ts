import Router from "express"
import { shortenLink } from "../controllers/linkController";


const router = Router();

router.post('/shorten',shortenLink);


export default router;
import Router from "express"
import { shortenLink, addToCampaign, deleteLink, expandLink, getUserLinks} from "../controllers/linkController";


const router = Router();

router.post('/expand',expandLink)
router.post('/shorten',shortenLink);
router.put('/shorten',addToCampaign)
router.delete('/shorten', deleteLink);
router.get('/links',getUserLinks);

export default router;
import Router from "express"
import { shortenLink, addToCampaign, deleteLink, expandLink, getUserLinks, visitLink } from "../controllers/linkController";
import { trackLinkMiddleware } from "../middlewares/analyticsMiddleware";

const router = Router();

router.post('/expand',trackLinkMiddleware,expandLink)
router.post('/shorten',trackLinkMiddleware,shortenLink);
router.put('/shorten',addToCampaign)
router.delete('/shorten', deleteLink);
router.get('/links',getUserLinks);
router.get('/:shortUrl',trackLinkMiddleware, visitLink);
export default router;
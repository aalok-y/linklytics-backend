import Router from "express"
import { shortenLink, addToCampaign, deleteLink, expandLink, getUserLinks, visitLink } from "../controllers/linkController";
import { trackLinkMiddleware } from "../middlewares/analyticsMiddleware";

const router = Router();

router.post('/expand', expandLink)
router.post('/shorten', shortenLink);
router.put('/shorten', addToCampaign)
router.delete('/shorten', deleteLink);
router.get('/links', getUserLinks);
router.get('/:shortUrl', trackLinkMiddleware, visitLink);
export default router;

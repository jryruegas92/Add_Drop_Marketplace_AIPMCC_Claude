import { Router } from 'express';
import {
  getOffersForPost,
  getMyOffers,
  getReceivedOffers,
  createOffer,
  updateOfferStatus
} from '../controllers/offerController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/post/:post_id', authenticateToken, getOffersForPost);
router.get('/my', authenticateToken, getMyOffers);
router.get('/received', authenticateToken, getReceivedOffers);
router.post('/', authenticateToken, createOffer);
router.patch('/:id/status', authenticateToken, updateOfferStatus);

export default router;

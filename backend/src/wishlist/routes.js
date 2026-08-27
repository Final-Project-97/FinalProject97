import { Router } from 'express';
import { requireAuth } from '../auth/middleware.js';
import {
  listWishlist,
  createWishlist,
  updateWishlist,
  deleteWishlist,
} from './controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listWishlist);
router.post('/', createWishlist);
router.put('/:id', updateWishlist);
router.delete('/:id', deleteWishlist);

export const wishlistRoutes = router;
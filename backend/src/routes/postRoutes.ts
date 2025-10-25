import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  getMyPosts,
  createPost,
  updatePostStatus,
  deletePost
} from '../controllers/postController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getAllPosts);
router.get('/my', authenticateToken, getMyPosts);
router.get('/:id', optionalAuth, getPostById);
router.post('/', authenticateToken, createPost);
router.patch('/:id/status', authenticateToken, updatePostStatus);
router.delete('/:id', authenticateToken, deletePost);

export default router;

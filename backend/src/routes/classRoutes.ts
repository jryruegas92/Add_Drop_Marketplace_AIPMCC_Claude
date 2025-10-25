import { Router } from 'express';
import { getAllClasses, getEnrolledClasses, enrollInClass, unenrollFromClass } from '../controllers/classController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/all', getAllClasses);
router.get('/enrolled', authenticateToken, getEnrolledClasses);
router.post('/enroll', authenticateToken, enrollInClass);
router.delete('/enroll/:class_id', authenticateToken, unenrollFromClass);

export default router;

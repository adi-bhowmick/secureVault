import express from 'express';
import userController from '../controllers/userController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', authenticate, userController.getMe);

export default router;

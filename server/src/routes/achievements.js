import express from 'express';
import achievementController from '../controllers/achievementController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', achievementController.getAll);
router.get('/leaderboard', achievementController.getLeaderboard);
router.get('/mine', authenticate, achievementController.getUserAchievements);
router.get('/stats', authenticate, achievementController.getStats);

export default router;

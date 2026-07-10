import express from 'express';
import authRoutes from './auth.js';
import labRoutes from './labs.js';
import achievementRoutes from './achievements.js';
import userRoutes from './users.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'JWTLab API' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/labs', labRoutes);
router.use('/achievements', achievementRoutes);

export default router;

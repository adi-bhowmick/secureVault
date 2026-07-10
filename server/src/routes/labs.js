import express from 'express';
import labController from '../controllers/labController.js';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', labController.listLabs);
router.get('/:slug', labController.getLab);
router.post('/:slug/submit', authenticate, labController.submitFlag);

export default router;

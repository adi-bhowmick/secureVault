import express from 'express';
import authController from '../controllers/authController.js';
import authValidators from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', authValidators.register, authController.register);
router.post('/login', authValidators.login, authController.login);

export default router;

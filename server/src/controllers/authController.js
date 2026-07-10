import { validationResult } from 'express-validator';
import authService from '../services/authService.js';
import achievementService from '../services/achievementService.js';

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });

    if (!result.success) {
      return res.status(409).json(result);
    }

    await achievementService.awardAchievement(result.data.user.id, 'first-login');

    return res.status(201).json(result);
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export default { register, login };

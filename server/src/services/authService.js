import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';

const SALT_ROUNDS = 10;

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

const register = async ({ username, email, password }) => {
  const existingEmail = await userRepository.findByEmail(email);
  if (existingEmail) {
    return { success: false, message: 'Email already in use' };
  }

  const existingUsername = await userRepository.findByUsername(username);
  if (existingUsername) {
    return { success: false, message: 'Username already taken' };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ username, email, passwordHash });
  const token = generateToken(user.id);

  return {
    success: true,
    message: 'Registration successful',
    data: { user, token },
  };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    return { success: false, message: 'Invalid credentials' };
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return { success: false, message: 'Invalid credentials' };
  }

  const token = generateToken(user.id);

  return {
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        total_points: user.total_points,
        labs_completed: user.labs_completed,
      },
      token,
    },
  };
};

export default { register, login, generateToken };

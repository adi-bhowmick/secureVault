import achievementService from '../services/achievementService.js';

const getAll = async (req, res) => {
  try {
    const achievements = await achievementService.getAllAchievements();
    return res.json({ success: true, data: { achievements } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUserAchievements = async (req, res) => {
  try {
    const achievements = await achievementService.getUserAchievements(req.user.id);
    return res.json({ success: true, data: { achievements } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const leaderboard = await achievementService.getLeaderboard(limit);
    return res.json({ success: true, data: { leaderboard } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getStats = async (req, res) => {
  const user = req.user;
  const stats = await import('../repositories/userRepository.js').then((m) =>
    m.default.findById(user.id)
  );
  if (!stats) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const progress = achievementService.getXpProgress(stats.xp);
  return res.json({ success: true, data: { user: stats, progress } });
};

export default { getAll, getUserAchievements, getLeaderboard, getStats };

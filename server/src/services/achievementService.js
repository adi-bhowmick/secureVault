import achievementRepository from '../repositories/achievementRepository.js';
import userRepository from '../repositories/userRepository.js';

const XP_PER_LEVEL = 200;

const getLevel = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;

const getXpForNextLevel = (level) => level * XP_PER_LEVEL;

const getXpProgress = (xp) => {
  const level = getLevel(xp);
  const currentLevelXp = (level - 1) * XP_PER_LEVEL;
  const nextLevelXp = level * XP_PER_LEVEL;
  const progress = xp - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;
  return { level, progress, needed, percentage: Math.round((progress / needed) * 100) };
};

const getAllAchievements = async () => {
  return achievementRepository.findAll();
};

const getUserAchievements = async (userId) => {
  const earned = await achievementRepository.findUserAchievements(userId);
  const all = await achievementRepository.findAll();

  return all.map((a) => ({
    ...a,
    earned: earned.some((e) => e.slug === a.slug),
    earned_at: earned.find((e) => e.slug === a.slug)?.earned_at || null,
  }));
};

const awardAchievement = async (userId, slug, client) => {
  const already = await achievementRepository.hasUserAchievement(userId, slug, client);
  if (already) return null;

  const achievement = await achievementRepository.findBySlug(slug, client);
  if (!achievement) return null;

  await achievementRepository.awardToUser(userId, slug, client);
  await userRepository.addXP(userId, achievement.xp_reward, client);

  return achievement;
};

const getLeaderboard = async (limit = 20) => {
  return userRepository.getLeaderboard(limit);
};

export default {
  getLevel,
  getXpForNextLevel,
  getXpProgress,
  getAllAchievements,
  getUserAchievements,
  awardAchievement,
  getLeaderboard,
};

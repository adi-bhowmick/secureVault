import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api.js';

const container = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const SkeletonCard = () => (
  <div className="bg-black/60 border border-white/[0.06] rounded-xl p-5 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white/[0.04] rounded-lg animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-24 bg-white/[0.04] rounded animate-pulse" />
        <div className="h-3 w-12 bg-white/[0.04] rounded animate-pulse" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full bg-white/[0.04] rounded animate-pulse" />
      <div className="h-3 w-2/3 bg-white/[0.04] rounded animate-pulse" />
    </div>
  </div>
);

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get('/achievements/mine');
        setAchievements(res.data.data.achievements);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const earned = achievements.filter((a) => a.earned).length;
  const total = achievements.length;
  const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Achievements</h1>
          <p className="text-sm text-neutral-500 mt-1">Unlock badges by completing security challenges</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-600">{earned}/{total} earned</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Completion</p>
          <span className="text-sm font-mono text-yellow-400">{percentage}%</span>
        </div>
        <div className="w-full bg-white/[0.04] rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"
            style={{ boxShadow: '0 0 12px rgba(234,179,8,0.3)' }}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && achievements.length === 0 && (
        <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.853m0 0l.003.003m0-.003a6.023 6.023 0 01-2.77-.853m0 0a6.022 6.022 0 01-2.48-5.228" />
            </svg>
          </div>
          <p className="text-neutral-400 text-sm mb-1">No achievements yet</p>
          <p className="text-neutral-600 text-xs font-mono">Complete labs to unlock badges</p>
        </div>
      )}

      {/* Achievement cards */}
      {!loading && achievements.length > 0 && (
        <motion.div
          variants={container}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {achievements.map((a) => {
            const isEarned = a.earned;
            return (
              <motion.div
                key={a.slug}
                variants={item}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  isEarned
                    ? 'bg-black/60 backdrop-blur-sm border-yellow-500/20 hover:border-yellow-500/30'
                    : 'bg-black/40 border-white/[0.04] opacity-50'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl ${
                      isEarned
                        ? 'bg-yellow-500/[0.1] border border-yellow-500/20'
                        : 'bg-white/[0.03] border border-white/[0.06]'
                    }`}>
                      {isEarned ? (a.icon || '🏆') : (
                        <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.853m0 0l.003.003m0-.003a6.023 6.023 0 01-2.77-.853m0 0a6.022 6.022 0 01-2.48-5.228" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-semibold text-sm ${isEarned ? 'text-white' : 'text-neutral-500'}`}>
                        {a.name}
                      </h3>
                      <span className={`text-[10px] font-mono ${isEarned ? 'text-yellow-400' : 'text-neutral-700'}`}>
                        +{a.xp_reward} XP
                      </span>
                    </div>
                    {isEarned && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/[0.1] border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${isEarned ? 'text-neutral-400' : 'text-neutral-700'}`}>
                    {a.description}
                  </p>
                </div>

                {/* Footer */}
                {isEarned && a.earned_at && (
                  <div className="px-5 py-2.5 border-t border-white/[0.04] bg-yellow-500/[0.02]">
                    <p className="text-[10px] font-mono text-neutral-600 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Earned {new Date(a.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Achievements;

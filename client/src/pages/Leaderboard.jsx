import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const rowVariants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
};

const rankStyles = {
  0: { bg: 'bg-yellow-500/[0.08]', border: 'border-yellow-500/20', text: 'text-yellow-400', medal: '🥇' },
  1: { bg: 'bg-neutral-300/[0.06]', border: 'border-neutral-400/20', text: 'text-neutral-300', medal: '🥈' },
  2: { bg: 'bg-orange-500/[0.08]', border: 'border-orange-500/20', text: 'text-orange-400', medal: '🥉' },
};

const SkeletonTable = () => (
  <div className="bg-black/60 border border-white/[0.06] rounded-xl overflow-hidden">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < 5 ? 'border-b border-white/[0.04]' : ''}`}>
        <div className="w-8 h-8 bg-white/[0.04] rounded-lg animate-pulse" />
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-white/[0.04] rounded-full animate-pulse" />
          <div className="h-4 w-24 bg-white/[0.04] rounded animate-pulse" />
        </div>
        <div className="h-4 w-12 bg-white/[0.04] rounded animate-pulse" />
        <div className="h-4 w-10 bg-white/[0.04] rounded animate-pulse" />
        <div className="h-4 w-8 bg-white/[0.04] rounded animate-pulse" />
      </div>
    ))}
  </div>
);

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/achievements/leaderboard');
        setLeaderboard(res.data.data.leaderboard);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leaderboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Top security researchers ranked by experience</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-neutral-600">{leaderboard.length} players</span>
        </div>
      </div>

      {/* Loading */}
      {loading && <SkeletonTable />}

      {/* Empty state */}
      {!loading && leaderboard.length === 0 && (
        <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.853m0 0l.003.003m0-.003a6.023 6.023 0 01-2.77-.853m0 0a6.022 6.022 0 01-2.48-5.228" />
            </svg>
          </div>
          <p className="text-neutral-400 text-sm mb-1">No players yet</p>
          <p className="text-neutral-600 text-xs font-mono">Complete labs to climb the ranks</p>
        </div>
      )}

      {/* Top 3 podium */}
      {!loading && topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {topThree.map((p, i) => {
            const rs = rankStyles[i];
            const isCurrentUser = user?.id === p.id;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-black/60 backdrop-blur-sm border rounded-xl p-5 text-center ${
                  isCurrentUser ? 'border-green-500/30' : rs.border
                }`}
              >
                <div className={`text-3xl mb-2`}>{rs.medal}</div>
                <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-yellow-500/[0.1] border border-yellow-500/20 text-yellow-400' :
                  i === 1 ? 'bg-neutral-300/[0.08] border border-neutral-400/20 text-neutral-300' :
                  'bg-orange-500/[0.1] border border-orange-500/20 text-orange-400'
                }`}>
                  {p.username[0].toUpperCase()}
                </div>
                <p className={`font-semibold text-sm mb-1 ${isCurrentUser ? 'text-green-400' : 'text-white'}`}>
                  {p.username}
                </p>
                <p className="text-xs font-mono text-yellow-400">{p.xp} XP</p>
                {isCurrentUser && (
                  <span className="inline-block mt-2 text-[9px] font-mono text-green-400 bg-green-500/[0.08] border border-green-500/20 px-2 py-0.5 rounded-full">
                    YOU
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      {!loading && leaderboard.length > 0 && (
        <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[3rem_1fr_5rem_5rem_5rem] gap-4 px-5 py-3 border-b border-white/[0.06]">
            <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">#</span>
            <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">Player</span>
            <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider text-right">XP</span>
            <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider text-right">Level</span>
            <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider text-right">Labs</span>
          </div>

          {/* Rows */}
          <motion.div
            initial="initial"
            animate="animate"
            className="divide-y divide-white/[0.04]"
          >
            {leaderboard.map((p, i) => {
              const isCurrentUser = user?.id === p.id;
              const rs = rankStyles[i];
              const isTop3 = i < 3;

              return (
                <motion.div
                  key={p.id}
                  variants={rowVariants}
                  transition={{ delay: i * 0.03 }}
                  className={`grid grid-cols-[3rem_1fr_5rem_5rem_5rem] gap-4 px-5 py-3.5 items-center transition-colors ${
                    isCurrentUser
                      ? 'bg-green-500/[0.04] hover:bg-green-500/[0.06]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Rank */}
                  <span className={`font-bold text-sm ${isTop3 ? rs.text : 'text-neutral-600 font-mono'}`}>
                    {isTop3 ? (
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${rs.bg} border ${rs.border} text-sm`}>
                        {rs.medal}
                      </span>
                    ) : (
                      i + 1
                    )}
                  </span>

                  {/* Player */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isCurrentUser
                        ? 'bg-green-500/[0.1] border border-green-500/20 text-green-400'
                        : isTop3
                        ? `bg-white/[0.04] border ${rs.border} ${rs.text}`
                        : 'bg-white/[0.03] border border-white/[0.06] text-neutral-500'
                    }`}>
                      {p.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className={`font-medium text-sm ${isCurrentUser ? 'text-green-400' : 'text-white'}`}>
                        {p.username}
                      </span>
                      {isCurrentUser && (
                        <span className="ml-2 text-[9px] font-mono text-green-400 bg-green-500/[0.08] border border-green-500/20 px-1.5 py-0.5 rounded-full">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>

                  {/* XP */}
                  <span className="text-sm font-mono text-yellow-400 text-right">{p.xp}</span>

                  {/* Level */}
                  <span className="text-sm font-mono text-blue-400 text-right">Lv.{p.level}</span>

                  {/* Labs */}
                  <span className="text-sm font-mono text-neutral-400 text-right">{p.labs_completed}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

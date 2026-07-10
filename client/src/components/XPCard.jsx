import { useAuth } from '../context/AuthContext.jsx';

const XPCard = () => {
  const { user } = useAuth();
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const xpForNext = level * 200;
  const progress = Math.min((xp / xpForNext) * 100, 100);

  return (
    <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.1] transition-colors duration-300 h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Experience</p>
        <div className="w-8 h-8 rounded-lg bg-yellow-500/[0.08] border border-yellow-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
      </div>

      <div className="mb-4">
        <span className="text-3xl font-bold text-white">{xp}</span>
        <span className="text-neutral-600 text-sm ml-1.5 font-mono">/ {xpForNext} XP</span>
      </div>

      <div className="w-full bg-white/[0.04] rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #facc15, #f59e0b)',
            boxShadow: '0 0 12px rgba(250, 204, 21, 0.3)',
          }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-mono">
        <span className="text-neutral-600">Level {level}</span>
        <span className="text-neutral-600">{xpForNext - xp} XP to Lv.{level + 1}</span>
      </div>
    </div>
  );
};

export default XPCard;

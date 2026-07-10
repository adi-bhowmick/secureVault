import { useAuth } from '../context/AuthContext.jsx';

const getRank = (level) => {
  if (level >= 10) return 'Expert';
  if (level >= 7) return 'Advanced';
  if (level >= 4) return 'Intermediate';
  return 'Beginner';
};

const ProfileCard = () => {
  const { user } = useAuth();

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  const rank = getRank(user?.level || 1);

  return (
    <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.1] transition-colors duration-300 h-full">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <span className="text-black text-xl font-bold font-mono">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-semibold truncate">{user?.username}</h3>
          <p className="text-neutral-500 text-sm truncate font-mono">{user?.email}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-1">Joined</p>
          <p className="text-white text-sm">{joinDate}</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-1">Rank</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <p className="text-white text-sm">{rank}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

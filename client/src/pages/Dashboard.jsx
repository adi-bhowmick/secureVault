import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { AnimatedCard } from '../components/AnimatedCard.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import XPCard from '../components/XPCard.jsx';
import ProgressCard from '../components/ProgressCard.jsx';
import api from '../services/api.js';

const colorMap = {
  emerald: { bg: 'bg-emerald-500/[0.08]', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'group-hover:shadow-emerald-500/[0.06]' },
  yellow: { bg: 'bg-yellow-500/[0.08]', border: 'border-yellow-500/20', text: 'text-yellow-400', glow: 'group-hover:shadow-yellow-500/[0.06]' },
  orange: { bg: 'bg-orange-500/[0.08]', border: 'border-orange-500/20', text: 'text-orange-400', glow: 'group-hover:shadow-orange-500/[0.06]' },
  blue: { bg: 'bg-blue-500/[0.08]', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'group-hover:shadow-blue-500/[0.06]' },
};

const StatCard = ({ label, value, icon, color }) => {
  const c = colorMap[color];
  return (
    <div className={`group relative bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-all duration-300 hover:shadow-lg ${c.glow}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
          <svg className={`w-4 h-4 ${c.text}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
      <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
};

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [achRes, labsRes] = await Promise.all([
          api.get('/achievements/mine'),
          api.get('/labs'),
        ]);
        setAchievements(achRes.data.data.achievements || []);
        setLabs(labsRes.data.data.labs || []);
      } catch {
        // stats will show defaults
      }
    };
    fetchStats();
  }, []);

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalLabs = labs.length;
  const completedLabs = user?.labs_completed || 0;

  const stats = [
    { label: 'Total Points', value: user?.total_points ?? 0, icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z', color: 'emerald' },
    { label: 'Achievements', value: `${earnedCount}/${achievements.length || 0}`, icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.853m0 0l.003.003m0-.003a6.023 6.023 0 01-2.77-.853m0 0a6.022 6.022 0 01-2.48-5.228', color: 'yellow' },
    { label: 'Labs Completed', value: `${completedLabs}/${totalLabs || 5}`, icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5', color: 'orange' },
    { label: 'Level', value: user?.level ?? 1, icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z', color: 'blue' },
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Welcome back, <span className="text-green-400 font-mono">{user?.username}</span></p>
        </div>

        {/* Main cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <AnimatedCard delay={0}><ProfileCard /></AnimatedCard>
          <AnimatedCard delay={0.08}><XPCard /></AnimatedCard>
          <AnimatedCard delay={0.16}><ProgressCard /></AnimatedCard>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <AnimatedCard key={s.label} delay={0.2 + i * 0.06}>
              <StatCard
                label={s.label}
                value={s.value}
                icon={s.icon}
                color={s.color}
              />
            </AnimatedCard>
          ))}
        </div>
      </div>
  );
};

export default Dashboard;

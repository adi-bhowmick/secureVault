import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const diffColors = {
  Easy: { bg: 'bg-emerald-500/[0.08]', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  Medium: { bg: 'bg-yellow-500/[0.08]', border: 'border-yellow-500/20', text: 'text-yellow-400' },
  Hard: { bg: 'bg-red-500/[0.08]', border: 'border-red-500/20', text: 'text-red-400' },
};

const ProgressCard = () => {
  const { user } = useAuth();
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await api.get('/labs');
        setLabs(res.data.data.labs || []);
      } catch {
        // use empty list
      }
    };
    fetchLabs();
  }, []);

  const completed = user?.labs_completed || 0;
  const total = labs.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.1] transition-colors duration-300 h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Lab Progress</p>
        <div className="w-8 h-8 rounded-lg bg-green-500/[0.08] border border-green-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-3xl font-bold text-white">{completed}</span>
        <span className="text-neutral-600 text-sm mb-1 font-mono">/ {total} labs</span>
      </div>

      <div className="w-full bg-white/[0.04] rounded-full h-2 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #22c55e, #10b981)',
            boxShadow: '0 0 12px rgba(34, 197, 94, 0.3)',
          }}
        />
      </div>

      <div className="space-y-2">
        {labs.map((lab) => {
          const dc = diffColors[lab.difficulty] || diffColors.Easy;
          return (
            <div key={lab.slug} className="flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-neutral-700 group-hover:bg-green-400 transition-colors" />
                <span className="text-neutral-400 group-hover:text-neutral-300 transition-colors">{lab.name}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${dc.bg} ${dc.border} ${dc.text}`}>
                {lab.difficulty}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressCard;

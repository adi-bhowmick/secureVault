import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import labService from '../services/labService.js';

const diffStyles = {
  Easy: { bg: 'bg-emerald-500/[0.08]', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  Medium: { bg: 'bg-yellow-500/[0.08]', border: 'border-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  Hard: { bg: 'bg-red-500/[0.08]', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
};

const container = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const SkeletonCard = () => (
  <div className="bg-black/60 border border-white/[0.06] rounded-xl p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-5 w-16 bg-white/[0.04] rounded-md animate-pulse" />
      <div className="h-4 w-12 bg-white/[0.04] rounded animate-pulse" />
    </div>
    <div className="h-5 w-3/4 bg-white/[0.04] rounded animate-pulse" />
    <div className="space-y-2">
      <div className="h-3 w-full bg-white/[0.04] rounded animate-pulse" />
      <div className="h-3 w-2/3 bg-white/[0.04] rounded animate-pulse" />
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
      <div className="h-3 w-20 bg-white/[0.04] rounded animate-pulse" />
      <div className="h-6 w-6 bg-white/[0.04] rounded-full animate-pulse" />
    </div>
  </div>
);

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await labService.listLabs();
        setLabs(res.data.data.labs);
      } catch {
        setError('Failed to load labs');
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, []);

  const filteredLabs = filter === 'All' ? labs : labs.filter(l => l.difficulty === filter);
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Labs</h1>
          <p className="text-sm text-neutral-500 mt-1">Hands-on security challenges to sharpen your skills</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-neutral-600">{labs.length} labs</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {difficulties.map((d) => {
          const active = filter === d;
          const ds = d === 'All' ? null : diffStyles[d];
          return (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${
                active
                  ? d === 'All'
                    ? 'bg-white/[0.06] border-white/[0.12] text-white'
                    : `${ds.bg} ${ds.border} ${ds.text}`
                  : 'bg-transparent border-white/[0.06] text-neutral-600 hover:text-neutral-400 hover:border-white/[0.1]'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="bg-red-500/[0.06] border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-2"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredLabs.length === 0 && !error && (
        <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <p className="text-neutral-400 text-sm mb-1">No labs found</p>
          <p className="text-neutral-600 text-xs font-mono">
            {filter === 'All' ? 'No labs available yet' : `No ${filter.toLowerCase()} labs available`}
          </p>
        </div>
      )}

      {/* Lab cards */}
      {!loading && filteredLabs.length > 0 && (
        <motion.div
          variants={container}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredLabs.map((lab) => {
              const ds = diffStyles[lab.difficulty] || diffStyles.Easy;
              return (
                <motion.div
                  key={lab.slug}
                  variants={item}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Link
                    to={`/dashboard/labs/${lab.slug}`}
                    className="block bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all duration-300 group h-full"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md border ${ds.bg} ${ds.border} ${ds.text}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${ds.dot} mr-1.5 -mb-px`} />
                        {lab.difficulty}
                      </span>
                      <span className="text-xs font-mono text-yellow-400/80 bg-yellow-500/[0.06] border border-yellow-500/20 px-2 py-1 rounded-md">
                        {lab.points} pts
                      </span>
                    </div>

                    {/* Title + description */}
                    <h2 className="text-white font-semibold mb-2 group-hover:text-green-400 transition-colors">
                      {lab.name}
                    </h2>
                    <p className="text-neutral-500 text-sm line-clamp-2 leading-relaxed mb-4">
                      {lab.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                      {lab.category ? (
                        <span className="text-[11px] font-mono text-neutral-600 flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                          </svg>
                          {lab.category}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="text-neutral-700 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Labs;

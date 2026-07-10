import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import labService from '../services/labService.js';
import LabChallenge from '../components/LabChallenge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const diffStyles = {
  Easy: { bg: 'bg-emerald-500/[0.08]', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  Medium: { bg: 'bg-yellow-500/[0.08]', border: 'border-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  Hard: { bg: 'bg-red-500/[0.08]', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
};

const objectives = {
  'weak-secret': [
    'Decode the JWT header to identify the algorithm',
    'Decode the payload to understand the token structure',
    'Use the wordlist attack to brute-force the weak secret',
    'Once cracked, submit the flag to complete the challenge',
  ],
  'expired-token': [
    'Decode the JWT payload',
    'Identify the `exp` (expiration) claim',
    'Understand why the token is expired',
    'Submit the flag based on what you learned',
  ],
  'payload-tampering': [
    'Decode the tampered token payload',
    'Compare it with the original token',
    'Identify which field was modified',
    'Submit the flag describing the change',
  ],
  'role-escalation': [
    'Decode the token to find the current role',
    'Recall the weak secret from cracking labs',
    'Forge a new token with `role: "admin"`',
    'Submit the flag to confirm escalation',
  ],
  'signature-verification': [
    'Decode the token header — check the algorithm',
    'Understand what `alg: "none"` means',
    'Learn how to forge a none-algorithm token',
    'Submit the flag to complete the challenge',
  ],
};

const SkeletonLoader = () => (
  <div className="space-y-4">
    <div className="h-4 w-24 bg-white/[0.04] rounded animate-pulse" />
    <div className="bg-black/60 border border-white/[0.06] rounded-xl p-6 space-y-4">
      <div className="h-6 w-32 bg-white/[0.04] rounded animate-pulse" />
      <div className="h-3 w-3/4 bg-white/[0.04] rounded animate-pulse" />
    </div>
    <div className="bg-black/60 border border-white/[0.06] rounded-xl h-64 animate-pulse" />
  </div>
);

const LabDetail = () => {
  const { slug } = useParams();
  const { refreshUser } = useAuth();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [resultError, setResultError] = useState('');
  const [visibleHints, setVisibleHints] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    const fetchLab = async () => {
      try {
        const res = await labService.getLab(slug);
        setLab(res.data.data.lab);
      } catch {
        setError('Failed to load lab');
      } finally {
        setLoading(false);
      }
    };
    fetchLab();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setResultError('');
    setSubmitting(true);
    try {
      const res = await labService.submitFlag(slug, flag);
      setResult(res.data);
      if (res.data.success) {
        await refreshUser();
      }
    } catch (err) {
      setResultError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStep = (i) => {
    setCompletedSteps(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  };

  if (loading) return <SkeletonLoader />;

  if (error || !lab) {
    return (
      <div className="space-y-6">
        <Link to="/dashboard/labs" className="inline-flex items-center gap-1.5 text-sm font-mono text-neutral-500 hover:text-green-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back to Labs
        </Link>
        <div className="bg-red-500/[0.06] border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          {error || 'Lab not found'}
        </div>
      </div>
    );
  }

  const ds = diffStyles[lab.difficulty] || diffStyles.Easy;
  const labObjectives = objectives[slug] || [];
  const labHints = lab.hints || [];
  const token = lab.tokens?.given;
  const progress = Math.round((completedSteps.length / labObjectives.length) * 100);

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link to="/dashboard/labs" className="inline-flex items-center gap-1.5 text-sm font-mono text-neutral-500 hover:text-green-400 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        Back to Labs
      </Link>

      {/* Header */}
      <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md border self-start ${ds.bg} ${ds.border} ${ds.text}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${ds.dot} mr-1.5 -mb-px`} />
            {lab.difficulty}
          </span>
          <span className="text-xs font-mono text-yellow-400/80 bg-yellow-500/[0.06] border border-yellow-500/20 px-2 py-1 rounded-md self-start">{lab.points} pts</span>
          {lab.category && (
            <span className="text-[11px] font-mono text-neutral-600 flex items-center gap-1.5 self-start">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
              {lab.category}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">{lab.name}</h1>
        <p className="text-neutral-400 text-sm leading-relaxed">{lab.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — challenge area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Interactive challenge */}
          {token && (
            <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-neutral-600 font-mono">challenge_terminal</span>
              </div>
              <div className="p-5">
                <LabChallenge slug={slug} token={token} tokens={lab.tokens} />
              </div>
            </div>
          )}

          {/* Background / Explanation */}
          {lab.explanation && (
            <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/[0.08] border border-blue-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  </div>
                  <span className="text-sm text-white font-medium">Read Explanation</span>
                </div>
                <svg className={`w-4 h-4 text-neutral-600 transition-transform duration-200 ${showExplanation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <AnimatePresence>
                {showExplanation && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="px-5 pb-5 border-t border-white/[0.04] pt-4">
                      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:font-semibold prose-p:text-neutral-300 prose-p:leading-relaxed prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-emerald-400 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-white/[0.03] prose-pre:border prose-pre:border-white/[0.06] prose-pre:rounded-lg prose-li:text-neutral-300 prose-ol:text-neutral-300 prose-ul:text-neutral-300 prose-blockquote:border-green-500/30 prose-blockquote:text-neutral-400 prose-blockquote:bg-green-500/[0.03] prose-blockquote:rounded-r-lg prose-blockquote:py-1">
                        <Markdown>{lab.explanation}</Markdown>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right column — objectives, hints, flag */}
        <div className="space-y-5">
          {/* Objectives */}
          <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Objectives</p>
                <span className="text-[10px] font-mono text-neutral-700">{completedSteps.length}/{labObjectives.length}</span>
              </div>
              <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {labObjectives.map((obj, i) => {
                const done = completedSteps.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleStep(i)}
                    className="w-full flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 border transition-colors ${
                      done ? 'bg-green-500/[0.1] border-green-500/30' : 'border-white/[0.1] bg-white/[0.02]'
                    }`}>
                      {done && <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                    </div>
                    <span className={`text-sm leading-relaxed ${done ? 'text-neutral-500 line-through' : 'text-neutral-300'}`}>{obj}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hints */}
          {labHints.length > 0 && (
            <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06]">
                <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Hints ({visibleHints}/{labHints.length})</p>
              </div>
              <div className="p-4 space-y-2">
                {labHints.slice(0, visibleHints).map((hint, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-yellow-500/[0.04] border border-yellow-500/10 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-mono text-yellow-400/60 mt-0.5">HINT {i + 1}</span>
                    </div>
                    <p className="text-sm text-neutral-300 mt-1">{hint}</p>
                  </motion.div>
                ))}
                {visibleHints < labHints.length && (
                  <button
                    onClick={() => setVisibleHints(h => h + 1)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-mono text-neutral-500 hover:text-yellow-400 border border-white/[0.06] hover:border-yellow-500/20 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reveal Hint {visibleHints + 1}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Flag submission */}
          <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-neutral-600 font-mono">submit_flag</span>
            </div>
            <div className="p-5">
              <AnimatePresence>
                {result && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/[0.1] border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-400 font-medium">{result.message}</p>
                        <p className="text-xs text-neutral-500 font-mono mt-0.5">+{result.data.points} pts earned</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {resultError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/[0.06] border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                    {resultError}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-700 font-mono text-sm">flag{`{`}</span>
                  <input
                    type="text"
                    value={flag}
                    onChange={(e) => { setFlag(e.target.value); setResult(null); setResultError(''); }}
                    placeholder="enter flag"
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono pl-14 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-green-500/40 focus:shadow-[0_0_20px_rgba(0,255,65,0.06)] transition-all duration-300 placeholder:text-neutral-800"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-700 font-mono text-sm">{`}`}</span>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-neutral-200 transition-all duration-300 disabled:opacity-40 hover:shadow-lg hover:shadow-white/[0.06] flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                      Submit Flag
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDetail;

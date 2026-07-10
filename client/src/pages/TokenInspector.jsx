import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const base64UrlDecode = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return atob(base64);
};

const ALG_RISK = {
  none: { level: 'critical', score: 30, desc: '"none" algorithm — token can be forged without a key' },
  HS256: { level: 'low', score: 0, desc: 'HMAC-SHA256 — secure symmetric algorithm' },
  HS384: { level: 'low', score: 0, desc: 'HMAC-SHA384 — secure symmetric algorithm' },
  HS512: { level: 'low', score: 0, desc: 'HMAC-SHA512 — secure symmetric algorithm' },
  RS256: { level: 'low', score: 0, desc: 'RSA-SHA256 — secure asymmetric algorithm' },
  RS384: { level: 'low', score: 0, desc: 'RSA-SHA384 — secure asymmetric algorithm' },
  RS512: { level: 'low', score: 0, desc: 'RSA-SHA512 — secure asymmetric algorithm' },
  ES256: { level: 'low', score: 0, desc: 'ECDSA P-256 — secure asymmetric algorithm' },
  ES384: { level: 'low', score: 0, desc: 'ECDSA P-384 — secure asymmetric algorithm' },
  ES512: { level: 'low', score: 0, desc: 'ECDSA P-521 — secure asymmetric algorithm' },
};

const COMMON_CLAIMS = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'];
const RECOMMENDED_CLAIMS = ['iss', 'aud', 'exp', 'iat'];

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-500/[0.06]', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-400', icon: 'M12 9v3.75m-9.303 3.375c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
  high: { bg: 'bg-orange-500/[0.06]', border: 'border-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400', icon: 'M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z' },
  medium: { bg: 'bg-yellow-500/[0.06]', border: 'border-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400', icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' },
  low: { bg: 'bg-green-500/[0.06]', border: 'border-green-500/20', text: 'text-green-400', dot: 'bg-green-400', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  info: { bg: 'bg-blue-500/[0.06]', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400', icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z' },
};

const inspectToken = (token) => {
  const parts = token.trim().split('.');
  if (parts.length !== 3) return { error: 'Invalid JWT — expected 3 parts' };

  let header, payload;
  try { header = JSON.parse(base64UrlDecode(parts[0])); }
  catch { return { error: 'Failed to decode header' }; }
  try { payload = JSON.parse(base64UrlDecode(parts[1])); }
  catch { return { error: 'Failed to decode payload' }; }

  const findings = [];
  let riskScore = 0;

  const algInfo = ALG_RISK[header.alg] || { level: 'high', score: 20, desc: `Unknown algorithm: ${header.alg}` };
  riskScore += algInfo.score;
  findings.push({ category: 'Algorithm', severity: algInfo.level, detail: algInfo.desc });

  if (header.alg === 'none') {
    findings.push({ category: 'Algorithm', severity: 'critical', detail: 'Token uses "none" — no signature verification needed' });
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp !== undefined) {
    if (payload.exp < now) {
      const expiredAgo = now - payload.exp;
      findings.push({ category: 'Expiration', severity: 'medium', detail: `Token expired ${expiredAgo}s ago (${new Date(payload.exp * 1000).toISOString()})` });
      riskScore += 10;
    } else {
      const expiresIn = payload.exp - now;
      findings.push({ category: 'Expiration', severity: 'low', detail: `Token valid for ${expiresIn}s (expires ${new Date(payload.exp * 1000).toISOString()})` });
    }
  } else {
    findings.push({ category: 'Expiration', severity: 'high', detail: 'No "exp" claim — token never expires' });
    riskScore += 20;
  }

  if (payload.nbf !== undefined) {
    if (payload.nbf > now) {
      findings.push({ category: 'Validity', severity: 'info', detail: `Token not valid before ${new Date(payload.nbf * 1000).toISOString()}` });
    } else {
      findings.push({ category: 'Validity', severity: 'low', detail: `Token became valid at ${new Date(payload.nbf * 1000).toISOString()}` });
    }
  }

  if (payload.iat !== undefined) {
    const age = now - payload.iat;
    if (age > 86400) {
      findings.push({ category: 'Freshness', severity: 'info', detail: `Token issued ${Math.floor(age / 3600)}h ago` });
    } else {
      findings.push({ category: 'Freshness', severity: 'low', detail: `Token issued ${Math.floor(age / 60)}m ago` });
    }
  } else {
    findings.push({ category: 'Freshness', severity: 'medium', detail: 'No "iat" claim — cannot determine token age' });
    riskScore += 10;
  }

  const missing = RECOMMENDED_CLAIMS.filter((c) => !(c in payload));
  if (missing.length > 0) {
    findings.push({ category: 'Claims', severity: 'medium', detail: `Missing recommended claims: ${missing.join(', ')}` });
    riskScore += missing.length * 5;
  }

  const present = Object.keys(payload).filter((k) => COMMON_CLAIMS.includes(k));
  if (present.length > 0) {
    findings.push({ category: 'Claims', severity: 'low', detail: `Standard claims present: ${present.join(', ')}` });
  }

  const custom = Object.keys(payload).filter((k) => !COMMON_CLAIMS.includes(k));
  if (custom.length > 0) {
    findings.push({ category: 'Claims', severity: 'info', detail: `Custom claims: ${custom.join(', ')}` });
  }

  if (payload.sub === undefined) {
    findings.push({ category: 'Claims', severity: 'info', detail: 'No "sub" claim — token does not identify a subject' });
  }

  if (payload.role !== undefined || payload.admin !== undefined || payload.isAdmin !== undefined || payload.roles !== undefined) {
    const roleClaim = payload.role || payload.isAdmin || payload.admin || payload.roles;
    findings.push({ category: 'Security', severity: 'medium', detail: `Token contains role/permission claim: ${JSON.stringify(roleClaim)}` });
    riskScore += 5;
  }

  riskScore = Math.min(100, Math.max(0, riskScore));

  return { header, payload, signature: parts[2], findings, riskScore };
};

const TokenInspector = () => {
  const [token, setToken] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInspect = () => {
    setError('');
    setResult(null);

    if (!token.trim()) {
      setError('Paste a JWT token to inspect');
      return;
    }

    const res = inspectToken(token);
    if (res.error) {
      setError(res.error);
    } else {
      setResult(res);
    }
  };

  const tokenParts = token.trim().split('.');
  const hasToken = tokenParts.length === 3 && tokenParts[0].length > 0;

  const riskColor =
    result?.riskScore >= 70 ? { bar: 'from-red-500 to-red-600', text: 'text-red-400', label: 'Critical', glow: 'shadow-red-500/20' } :
    result?.riskScore >= 40 ? { bar: 'from-orange-500 to-orange-600', text: 'text-orange-400', label: 'High', glow: 'shadow-orange-500/20' } :
    result?.riskScore >= 20 ? { bar: 'from-yellow-500 to-yellow-600', text: 'text-yellow-400', label: 'Medium', glow: 'shadow-yellow-500/20' } :
    { bar: 'from-green-500 to-emerald-500', text: 'text-green-400', label: 'Low', glow: 'shadow-green-500/20' };

  const categoryCounts = result?.findings.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Token Inspector</h1>
        <p className="text-sm text-neutral-500 mt-1">Deep security analysis and risk assessment for JWT tokens</p>
      </div>

      {/* Pipeline */}
      <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5">
        <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider mb-3">Analysis Pipeline</p>
        <div className="flex items-center gap-2 text-sm font-mono flex-wrap">
          <span className="px-3 py-1.5 rounded-md bg-blue-500/[0.08] border border-blue-500/20 text-blue-400">Token</span>
          <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span className="px-3 py-1.5 rounded-md bg-green-500/[0.08] border border-green-500/20 text-green-400">Decode</span>
          <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span className="px-3 py-1.5 rounded-md bg-yellow-500/[0.08] border border-yellow-500/20 text-yellow-400">Analyze</span>
          <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span className={`px-3 py-1.5 rounded-md border ${result ? 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400' : 'bg-neutral-500/[0.08] border-neutral-500/20 text-neutral-500'}`}>
            Report
          </span>
        </div>
      </div>

      {/* Token structure */}
      <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5">
        <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider mb-3">Token Structure</p>
        <div className="flex items-center gap-1 text-sm font-mono overflow-x-auto pb-1">
          <span className={`px-3 py-1.5 rounded-md border transition-colors ${
            hasToken ? 'bg-green-500/[0.08] border-green-500/20 text-green-400' : 'bg-white/[0.03] border-white/[0.06] text-neutral-600'
          }`}>
            {hasToken ? tokenParts[0].substring(0, 20) + (tokenParts[0].length > 20 ? '...' : '') : 'header'}
          </span>
          <span className="text-neutral-700">.</span>
          <span className={`px-3 py-1.5 rounded-md border transition-colors ${
            hasToken && tokenParts[1]?.length > 0 ? 'bg-yellow-500/[0.08] border-yellow-500/20 text-yellow-400' : 'bg-white/[0.03] border-white/[0.06] text-neutral-600'
          }`}>
            {hasToken && tokenParts[1] ? tokenParts[1].substring(0, 20) + (tokenParts[1].length > 20 ? '...' : '') : 'payload'}
          </span>
          <span className="text-neutral-700">.</span>
          <span className={`px-3 py-1.5 rounded-md border transition-colors ${
            hasToken && tokenParts[2]?.length > 0 ? 'bg-purple-500/[0.08] border-purple-500/20 text-purple-400' : 'bg-white/[0.03] border-white/[0.06] text-neutral-600'
          }`}>
            {hasToken && tokenParts[2] ? tokenParts[2].substring(0, 20) + (tokenParts[2].length > 20 ? '...' : '') : 'signature'}
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-neutral-600 font-mono">inspect</span>
        </div>
        <div className="p-5">
          <textarea
            value={token}
            onChange={(e) => { setToken(e.target.value); setError(''); setResult(null); }}
            placeholder="eyJhbGciOiJIUzI1NiIs..."
            rows={4}
            className="w-full bg-white/[0.03] border border-white/[0.08] text-green-400/80 text-sm font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-green-500/40 focus:shadow-[0_0_20px_rgba(0,255,65,0.06)] transition-all duration-300 placeholder:text-neutral-800 resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] font-mono text-neutral-700">
              {token.length > 0 ? `${token.length} chars` : 'Paste a JWT to analyze'}
            </span>
            <button
              onClick={handleInspect}
              className="bg-white text-black text-sm font-medium px-5 py-1.5 rounded-lg hover:bg-neutral-200 transition-all duration-300 hover:shadow-lg hover:shadow-white/[0.06] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              Inspect
            </button>
          </div>
        </div>
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

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Risk score card */}
            <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider mb-1">Security Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-bold ${riskColor.text}`}>{result.riskScore}</span>
                      <span className="text-neutral-700 font-mono text-sm">/100</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border ${riskColor.text === 'text-red-400' ? 'bg-red-500/[0.06] border-red-500/20' : riskColor.text === 'text-orange-400' ? 'bg-orange-500/[0.06] border-orange-500/20' : riskColor.text === 'text-yellow-400' ? 'bg-yellow-500/[0.06] border-yellow-500/20' : 'bg-green-500/[0.06] border-green-500/20'}`}>
                    <span className={`text-sm font-medium ${riskColor.text}`}>{riskColor.label} Risk</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white/[0.04] rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.riskScore}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${riskColor.bar}`}
                    style={{ boxShadow: `0 0 12px ${riskColor.text === 'text-red-400' ? 'rgba(239,68,68,0.3)' : riskColor.text === 'text-orange-400' ? 'rgba(249,115,22,0.3)' : riskColor.text === 'text-yellow-400' ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}` }}
                  />
                </div>
              </div>
            </div>

            {/* Category summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Algorithm', 'Expiration', 'Claims', 'Security'].map((cat) => {
                const count = categoryCounts?.[cat] || 0;
                const catFindings = result.findings.filter(f => f.category === cat);
                const worstSeverity = catFindings.reduce((worst, f) => {
                  const order = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
                  return order[f.severity] > order[worst] ? f.severity : worst;
                }, 'info');
                const ss = SEVERITY_STYLES[worstSeverity];
                return (
                  <div key={cat} className="bg-black/60 border border-white/[0.06] rounded-lg px-4 py-3">
                    <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-1">{cat}</p>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                      <span className="text-sm text-white font-medium">{count} {count === 1 ? 'finding' : 'findings'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Findings */}
            <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Findings ({result.findings.length})</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {result.findings.map((f, i) => {
                  const ss = SEVERITY_STYLES[f.severity];
                  return (
                    <div key={i} className="px-5 py-3.5 flex items-start gap-3 hover:bg-white/[0.01] transition-colors">
                      <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 ${ss.bg} border ${ss.border}`}>
                        <svg className={`w-3.5 h-3.5 ${ss.text}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={ss.icon} />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${ss.bg} ${ss.text}`}>
                            {f.severity}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-700">[{f.category}]</span>
                        </div>
                        <p className="text-sm text-neutral-300">{f.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decoded header + payload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Header</span>
                </div>
                <div className="p-4">
                  <pre className="text-[13px] font-mono text-green-400/80 overflow-auto max-h-[300px] leading-relaxed">
                    {JSON.stringify(result.header, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Payload</span>
                </div>
                <div className="p-4">
                  <pre className="text-[13px] font-mono text-yellow-400/80 overflow-auto max-h-[300px] leading-relaxed">
                    {JSON.stringify(result.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: 'Risk Scoring', desc: '0-100 vulnerability rating', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', color: 'green' },
            { title: 'Security Audit', desc: 'Automated vulnerability scan', icon: 'M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z', color: 'yellow' },
            { title: 'Claims Analysis', desc: 'Standard & custom claim audit', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', color: 'blue' },
          ].map((item) => (
            <div key={item.title} className="bg-black/40 border border-white/[0.04] rounded-xl p-5 text-center">
              <div className={`w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${
                item.color === 'green' ? 'bg-green-500/[0.06] border border-green-500/10' :
                item.color === 'yellow' ? 'bg-yellow-500/[0.06] border border-yellow-500/10' :
                'bg-blue-500/[0.06] border border-blue-500/10'
              }`}>
                <svg className={`w-5 h-5 ${
                  item.color === 'green' ? 'text-green-400' :
                  item.color === 'yellow' ? 'text-yellow-400' :
                  'text-blue-400'
                }`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <p className="text-sm text-white font-medium mb-1">{item.title}</p>
              <p className="text-[11px] text-neutral-600 font-mono">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenInspector;

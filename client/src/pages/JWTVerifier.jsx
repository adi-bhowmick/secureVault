import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const base64UrlDecode = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return atob(base64);
};

const hmacVerify = async (data, secret, signature, algorithm = 'SHA-256') => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: algorithm },
    false,
    ['verify']
  );
  const sigBytes = Uint8Array.from(base64UrlDecode(signature), (c) => c.charCodeAt(0));
  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));
};

const parseExpClaim = (payload) => {
  if (!payload.exp) return null;
  const exp = payload.exp * 1000;
  const now = Date.now();
  const diff = exp - now;
  return {
    expired: diff < 0,
    expDate: new Date(exp).toISOString(),
    secondsLeft: Math.round(diff / 1000),
  };
};

const JWTVerifier = () => {
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setError('');
    setResult(null);
    setVerifying(true);

    if (!token.trim()) {
      setError('Paste a JWT token');
      setVerifying(false);
      return;
    }
    if (!secret.trim()) {
      setError('Enter a secret key');
      setVerifying(false);
      return;
    }

    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      setError('Invalid JWT — expected 3 dot-separated parts');
      setVerifying(false);
      return;
    }

    let header, payload;
    try { header = JSON.parse(base64UrlDecode(parts[0])); }
    catch { setError('Failed to decode header'); setVerifying(false); return; }
    try { payload = JSON.parse(base64UrlDecode(parts[1])); }
    catch { setError('Failed to decode payload'); setVerifying(false); return; }

    if (header.alg !== 'HS256') {
      setResult({
        valid: false,
        header,
        payload,
        reason: `Unsupported algorithm: ${header.alg}. Only HS256 is supported.`,
        expInfo: parseExpClaim(payload),
      });
      setVerifying(false);
      return;
    }

    const signingInput = `${parts[0]}.${parts[1]}`;

    try {
      const valid = await hmacVerify(signingInput, secret, parts[2]);
      setResult({
        valid,
        header,
        payload,
        reason: valid
          ? 'Signature is valid. The token was signed with this secret and has not been tampered with.'
          : 'Signature is INVALID. The token was NOT signed with this secret, or has been modified.',
        expInfo: parseExpClaim(payload),
      });
    } catch (err) {
      setError('Verification failed: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const tokenParts = token.trim().split('.');
  const hasToken = tokenParts.length === 3 && tokenParts[0].length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Token Verifier</h1>
        <p className="text-sm text-neutral-500 mt-1">Verify JWT signature integrity with a secret key</p>
      </div>

      {/* Pipeline */}
      <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5">
        <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider mb-3">Verification Flow</p>
        <div className="flex items-center gap-2 text-sm font-mono flex-wrap">
          <span className="px-3 py-1.5 rounded-md bg-blue-500/[0.08] border border-blue-500/20 text-blue-400">Token</span>
          <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span className="px-3 py-1.5 rounded-md bg-purple-500/[0.08] border border-purple-500/20 text-purple-400">Secret</span>
          <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span className="px-3 py-1.5 rounded-md bg-green-500/[0.08] border border-green-500/20 text-green-400">Verify</span>
          <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span className={`px-3 py-1.5 rounded-md border ${result?.valid ? 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400' : 'bg-neutral-500/[0.08] border-neutral-500/20 text-neutral-500'}`}>
            {result ? (result.valid ? 'Valid' : 'Invalid') : 'Result'}
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

      {/* Input card */}
      <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-neutral-600 font-mono">verify</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Token input */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">JWT Token</span>
            </div>
            <textarea
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(''); setResult(null); }}
              placeholder="eyJhbGciOiJIUzI1NiIs..."
              rows={4}
              className="w-full bg-white/[0.03] border border-white/[0.08] text-blue-400/80 text-sm font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500/40 focus:shadow-[0_0_20px_rgba(59,130,246,0.06)] transition-all duration-300 placeholder:text-neutral-800 resize-none"
            />
          </div>

          {/* Secret input */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Secret Key</span>
            </div>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(e) => { setSecret(e.target.value); setError(''); setResult(null); }}
                placeholder="your-256-bit-secret"
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-purple-500/40 focus:shadow-[0_0_20px_rgba(168,85,247,0.06)] transition-all duration-300 placeholder:text-neutral-800"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
              >
                {showSecret ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-neutral-200 transition-all duration-300 disabled:opacity-40 hover:shadow-lg hover:shadow-white/[0.06] flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                Verify Signature
              </>
            )}
          </button>
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
            {/* Verdict */}
            <div className={`rounded-xl border overflow-hidden ${
              result.valid
                ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                : 'bg-red-500/[0.04] border-red-500/20'
            }`}>
              <div className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    result.valid
                      ? 'bg-emerald-500/[0.1] border border-emerald-500/20'
                      : 'bg-red-500/[0.1] border border-red-500/20'
                  }`}>
                    {result.valid ? (
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${result.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.valid ? 'Signature Valid' : 'Signature Invalid'}
                    </h2>
                    <p className="text-sm text-neutral-400 mt-0.5">{result.reason}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expiration */}
            {result.expInfo && (
              <div className={`rounded-xl border px-5 py-4 flex items-center gap-3 ${
                result.expInfo.expired
                  ? 'bg-red-500/[0.04] border-red-500/20'
                  : 'bg-yellow-500/[0.04] border-yellow-500/20'
              }`}>
                <svg className={`w-5 h-5 flex-shrink-0 ${result.expInfo.expired ? 'text-red-400' : 'text-yellow-400'}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-sm font-mono ${result.expInfo.expired ? 'text-red-400' : 'text-yellow-400'}`}>
                  {result.expInfo.expired
                    ? `Expired ${Math.abs(result.expInfo.secondsLeft)}s ago`
                    : `Expires in ${result.expInfo.secondsLeft}s`}
                  <span className="text-neutral-600 ml-2">({new Date(result.expInfo.expDate).toLocaleString()})</span>
                </p>
              </div>
            )}

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
            { title: 'Signature', desc: 'Cryptographic proof of origin', icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z', color: 'purple' },
            { title: 'Integrity', desc: 'Detect token tampering', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', color: 'green' },
            { title: 'Expiration', desc: 'Check token validity window', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', color: 'yellow' },
          ].map((item) => (
            <div key={item.title} className="bg-black/40 border border-white/[0.04] rounded-xl p-5 text-center">
              <div className={`w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${
                item.color === 'green' ? 'bg-green-500/[0.06] border border-green-500/10' :
                item.color === 'yellow' ? 'bg-yellow-500/[0.06] border border-yellow-500/10' :
                'bg-purple-500/[0.06] border border-purple-500/10'
              }`}>
                <svg className={`w-5 h-5 ${
                  item.color === 'green' ? 'text-green-400' :
                  item.color === 'yellow' ? 'text-yellow-400' :
                  'text-purple-400'
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

export default JWTVerifier;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const base64UrlEncode = (data) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const hmacSign = async (data, secret, algorithm = 'SHA-256') => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
};

const DEFAULT_HEADER = { alg: 'HS256', typ: 'JWT' };
const DEFAULT_PAYLOAD = {
  sub: '1234567890',
  name: 'John Doe',
  iat: Math.floor(Date.now() / 1000),
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-600 hover:text-green-400 transition-colors px-2 py-1 rounded hover:bg-green-500/[0.05]"
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
          Copy
        </>
      )}
    </button>
  );
};

const JWTGenerator = () => {
  const [header, setHeader] = useState(JSON.stringify(DEFAULT_HEADER, null, 2));
  const [payload, setPayload] = useState(JSON.stringify(DEFAULT_PAYLOAD, null, 2));
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [showSecret, setShowSecret] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setError('');
    setToken('');
    setGenerating(true);

    let parsedHeader, parsedPayload;
    try {
      parsedHeader = JSON.parse(header);
    } catch {
      setError('Invalid header JSON');
      setGenerating(false);
      return;
    }
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      setError('Invalid payload JSON');
      setGenerating(false);
      return;
    }
    if (!secret) {
      setError('Secret is required');
      setGenerating(false);
      return;
    }

    const encodedHeader = base64UrlEncode(parsedHeader);
    const encodedPayload = base64UrlEncode(parsedPayload);
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    try {
      const signature = await hmacSign(signingInput, secret);
      setToken(`${signingInput}.${signature}`);
    } catch (err) {
      setError('Failed to sign token: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateIat = () => {
    try {
      const obj = JSON.parse(payload);
      obj.iat = Math.floor(Date.now() / 1000);
      setPayload(JSON.stringify(obj, null, 2));
    } catch { /* ignore */ }
  };

  const tokenParts = token ? token.split('.') : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Token Generator</h1>
        <p className="text-sm text-neutral-500 mt-1">Create and sign custom JWT tokens</p>
      </div>

      {/* Pipeline visual */}
      <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5">
        <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider mb-3">Generation Pipeline</p>
        <div className="flex items-center gap-2 text-sm font-mono flex-wrap">
          <span className="px-3 py-1.5 rounded-md bg-green-500/[0.08] border border-green-500/20 text-green-400">Header</span>
          <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span className="px-3 py-1.5 rounded-md bg-yellow-500/[0.08] border border-yellow-500/20 text-yellow-400">Payload</span>
          <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span className="px-3 py-1.5 rounded-md bg-purple-500/[0.08] border border-purple-500/20 text-purple-400">Sign</span>
          <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <span className="px-3 py-1.5 rounded-md bg-blue-500/[0.08] border border-blue-500/20 text-blue-400">Token</span>
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Header editor */}
        <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Header</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-700">JSON</span>
          </div>
          <textarea
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            rows={6}
            spellCheck={false}
            className="w-full bg-transparent text-green-400/80 text-[13px] font-mono px-5 py-4 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Payload editor */}
        <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Payload</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRegenerateIat}
                className="text-[11px] font-mono text-neutral-600 hover:text-yellow-400 transition-colors px-2 py-1 rounded hover:bg-yellow-500/[0.05]"
              >
                Refresh iat
              </button>
              <span className="text-[10px] font-mono text-neutral-700">JSON</span>
            </div>
          </div>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={8}
            spellCheck={false}
            className="w-full bg-transparent text-yellow-400/80 text-[13px] font-mono px-5 py-4 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Secret + Generate */}
      <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Signing Secret</span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter your secret key"
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono rounded-lg pl-4 pr-10 py-2.5 outline-none focus:border-purple-500/40 focus:shadow-[0_0_20px_rgba(168,85,247,0.06)] transition-all duration-300 placeholder:text-neutral-700"
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
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-white text-black text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-neutral-200 transition-all duration-300 disabled:opacity-40 hover:shadow-lg hover:shadow-white/[0.06] flex items-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  Generate
                </>
              )}
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

      {/* Output */}
      <AnimatePresence>
        {token && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Token stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/60 border border-white/[0.06] rounded-lg px-4 py-3 text-center">
                <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-1">Header</p>
                <p className="text-xs text-green-400 font-mono">{tokenParts[0]?.length} chars</p>
              </div>
              <div className="bg-black/60 border border-white/[0.06] rounded-lg px-4 py-3 text-center">
                <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-1">Payload</p>
                <p className="text-xs text-yellow-400 font-mono">{tokenParts[1]?.length} chars</p>
              </div>
              <div className="bg-black/60 border border-white/[0.06] rounded-lg px-4 py-3 text-center">
                <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-1">Signature</p>
                <p className="text-xs text-purple-400 font-mono">{tokenParts[2]?.length} chars</p>
              </div>
            </div>

            {/* Token output */}
            <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Generated Token</span>
                </div>
                <CopyButton text={token} />
              </div>
              <div className="p-5">
                <p className="text-[12px] font-mono text-neutral-500 break-all leading-relaxed bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
                  <span className="text-green-400/80">{tokenParts[0]}</span>
                  <span className="text-neutral-700">.</span>
                  <span className="text-yellow-400/80">{tokenParts[1]}</span>
                  <span className="text-neutral-700">.</span>
                  <span className="text-purple-400/80">{tokenParts[2]}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JWTGenerator;

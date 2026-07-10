import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const decodeBase64Url = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return JSON.parse(atob(base64));
};

const decodeToken = (token) => {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT — expected 3 dot-separated parts');
  const header = decodeBase64Url(parts[0]);
  const payload = decodeBase64Url(parts[1]);
  return { header, payload, signature: parts[2], parts };
};

const SAMPLE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTYyMzkwMjIsInJvbGQiOiJhZG1pbiIsInBlcm1pc3Npb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const algoLabels = {
  HS256: 'HMAC SHA-256',
  HS384: 'HMAC SHA-384',
  HS512: 'HMAC SHA-512',
  RS256: 'RSA SHA-256',
  RS384: 'RSA SHA-384',
  RS512: 'RSA SHA-512',
  ES256: 'ECDSA SHA-256',
  ES384: 'ECDSA SHA-384',
  ES512: 'ECDSA SHA-512',
};

const CopyButton = ({ text, label }) => {
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

const JsonBlock = ({ data, color }) => {
  const colors = {
    green: 'text-green-400/90',
    yellow: 'text-yellow-400/90',
    purple: 'text-purple-400/90',
  };
  return (
    <pre className={`text-[13px] leading-relaxed font-mono overflow-auto max-h-[400px] ${colors[color] || 'text-neutral-300'}`}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};

const JWTDecoder = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('header');

  const handleDecode = () => {
    setError('');
    setResult(null);
    if (!input.trim()) {
      setError('Paste a JWT token to decode');
      return;
    }
    try {
      const decoded = decodeToken(input);
      setResult(decoded);
      setActiveTab('header');
    } catch (err) {
      setError(err.message || 'Failed to decode token');
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleDecode();
  };

  const formatJson = (obj) => JSON.stringify(obj, null, 2);
  const tokenParts = input.trim().split('.');
  const hasToken = tokenParts.length === 3 && tokenParts[0].length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">JWT Decoder</h1>
        <p className="text-sm text-neutral-500 mt-1">Paste a JSON Web Token to inspect its contents</p>
      </div>

      {/* JWT Structure Visual */}
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
          <span className="ml-2 text-xs text-neutral-600 font-mono">input</span>
          <div className="flex-1" />
          <button
            onClick={() => { setInput(SAMPLE_TOKEN); setError(''); setResult(null); }}
            className="text-[11px] font-mono text-neutral-600 hover:text-green-400 transition-colors px-2 py-1 rounded hover:bg-green-500/[0.05]"
          >
            Load sample
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="eyJhbGciOiJIUzI1NiIs..."
          rows={4}
          className="w-full bg-transparent text-green-400/80 text-sm font-mono px-5 py-4 placeholder:text-neutral-800 outline-none resize-none"
        />
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono text-neutral-700">
            {input.length > 0 ? `${input.length} chars` : 'Ctrl+Enter to decode'}
          </span>
          <button
            onClick={handleDecode}
            className="bg-white text-black text-sm font-medium px-5 py-1.5 rounded-lg hover:bg-neutral-200 transition-all hover:shadow-lg hover:shadow-white/[0.06]"
          >
            Decode
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
            {/* Decoded info bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Algorithm', value: algoLabels[result.header.alg] || result.header.alg || '—', color: 'emerald' },
                { label: 'Type', value: result.header.typ || '—', color: 'blue' },
                { label: 'Issuer', value: result.payload.iss || '—', color: 'yellow' },
                { label: 'Expires', value: result.payload.exp ? new Date(result.payload.exp * 1000).toLocaleDateString() : '—', color: 'orange' },
              ].map((item) => (
                <div key={item.label} className="bg-black/60 border border-white/[0.06] rounded-lg px-4 py-3">
                  <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-sm text-white font-medium truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Tabbed output */}
            <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-center border-b border-white/[0.06]">
                {[
                  { id: 'header', label: 'Header', color: 'green' },
                  { id: 'payload', label: 'Payload', color: 'yellow' },
                  { id: 'signature', label: 'Signature', color: 'purple' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-mono transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-neutral-600 hover:text-neutral-400'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        tab.color === 'green' ? 'bg-green-400' : tab.color === 'yellow' ? 'bg-yellow-400' : 'bg-purple-400'
                      }`} />
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute bottom-0 left-0 right-0 h-[1px] ${
                          tab.color === 'green' ? 'bg-green-400' : tab.color === 'yellow' ? 'bg-yellow-400' : 'bg-purple-400'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
                    {activeTab === 'header' ? 'Decoded Header' : activeTab === 'payload' ? 'Decoded Payload' : 'Token Signature'}
                  </span>
                  <CopyButton
                    text={activeTab === 'signature' ? result.signature : formatJson(result[activeTab])}
                    label={activeTab}
                  />
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
                  {activeTab === 'signature' ? (
                    <p className="text-purple-400/90 text-[13px] font-mono break-all leading-relaxed">{result.signature}</p>
                  ) : (
                    <JsonBlock data={result[activeTab]} color={activeTab === 'header' ? 'green' : 'yellow'} />
                  )}
                </div>
              </div>
            </div>

            {/* Full token */}
            <div className="bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">Full Token</p>
                <CopyButton text={input.trim()} label="full" />
              </div>
              <p className="text-[12px] font-mono text-neutral-500 break-all leading-relaxed bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
                <span className="text-green-400/80">{result.parts[0]}</span>
                <span className="text-neutral-700">.</span>
                <span className="text-yellow-400/80">{result.parts[1]}</span>
                <span className="text-neutral-700">.</span>
                <span className="text-purple-400/80">{result.parts[2]}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: 'Header', desc: 'Algorithm & token type', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z', color: 'green' },
            { title: 'Payload', desc: 'Claims & user data', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', color: 'yellow' },
            { title: 'Signature', desc: 'Verification hash', icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z', color: 'purple' },
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

export default JWTDecoder;

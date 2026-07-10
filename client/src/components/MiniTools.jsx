import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const decodeBase64Url = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return JSON.parse(atob(base64));
};

const base64UrlEncode = (data) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// ─── Mini Decoder ───────────────────────────────────────────────────
export const MiniDecoder = ({ initialToken = '' }) => {
  const [token, setToken] = useState(initialToken);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('header');

  const decode = () => {
    setError('');
    setResult(null);
    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT');
      setResult({
        header: decodeBase64Url(parts[0]),
        payload: decodeBase64Url(parts[1]),
        signature: parts[2],
      });
      setTab('header');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={token}
        onChange={(e) => { setToken(e.target.value); setError(''); setResult(null); }}
        placeholder="Paste JWT token..."
        rows={3}
        className="w-full bg-white/[0.03] border border-white/[0.08] text-green-400/80 text-xs font-mono rounded-lg px-3 py-2.5 outline-none focus:border-green-500/40 transition-colors placeholder:text-neutral-800 resize-none"
      />
      <button onClick={decode} className="w-full py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors">
        Decode
      </button>
      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
      {result && (
        <div className="space-y-2">
          <div className="flex gap-1">
            {['header', 'payload', 'signature'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-[10px] font-mono rounded-md transition-colors ${tab === t ? 'bg-white/[0.06] text-white' : 'text-neutral-600 hover:text-neutral-400'}`}>
                {t}
              </button>
            ))}
          </div>
          <pre className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 text-[11px] font-mono overflow-auto max-h-[200px] leading-relaxed">
            <span className={tab === 'header' ? 'text-green-400/80' : tab === 'payload' ? 'text-yellow-400/80' : 'text-purple-400/80'}>
              {tab === 'signature' ? result.signature : JSON.stringify(result[tab], null, 2)}
            </span>
          </pre>
        </div>
      )}
    </div>
  );
};

// ─── Mini Verifier ──────────────────────────────────────────────────
export const MiniVerifier = ({ initialToken = '' }) => {
  const [token, setToken] = useState(initialToken);
  const [secret, setSecret] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const verify = async () => {
    setError('');
    setResult(null);
    setVerifying(true);
    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT');
      const header = decodeBase64Url(parts[0]);
      if (header.alg !== 'HS256') {
        setResult({ valid: false, reason: `Unsupported algorithm: ${header.alg}` });
        setVerifying(false);
        return;
      }
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      const sigBytes = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(`${parts[0]}.${parts[1]}`));
      setResult({ valid, reason: valid ? 'Signature is valid' : 'Signature is INVALID' });
    } catch (e) {
      setError(e.message);
    }
    setVerifying(false);
  };

  return (
    <div className="space-y-3">
      <textarea value={token} onChange={(e) => { setToken(e.target.value); setResult(null); }} placeholder="JWT Token..." rows={3}
        className="w-full bg-white/[0.03] border border-white/[0.08] text-green-400/80 text-xs font-mono rounded-lg px-3 py-2.5 outline-none focus:border-green-500/40 transition-colors placeholder:text-neutral-800 resize-none" />
      <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Secret key..."
        className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-xs font-mono rounded-lg px-3 py-2 outline-none focus:border-purple-500/40 transition-colors placeholder:text-neutral-700" />
      <button onClick={verify} disabled={verifying} className="w-full py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-40">
        {verifying ? 'Verifying...' : 'Verify Signature'}
      </button>
      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
      {result && (
        <div className={`rounded-lg px-3 py-2 text-xs font-mono ${result.valid ? 'bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-400' : 'bg-red-500/[0.06] border border-red-500/20 text-red-400'}`}>
          {result.valid ? '✓' : '✗'} {result.reason}
        </div>
      )}
    </div>
  );
};

// ─── Mini Inspector ─────────────────────────────────────────────────
export const MiniInspector = ({ initialToken = '' }) => {
  const [token, setToken] = useState(initialToken);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const inspect = () => {
    setError('');
    setResult(null);
    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT');
      const header = decodeBase64Url(parts[0]);
      const payload = decodeBase64Url(parts[1]);
      const findings = [];
      let score = 0;

      if (header.alg === 'none') { findings.push({ sev: 'critical', text: '"none" algorithm — forgeable' }); score += 30; }
      else if (['HS256','HS384','HS512','RS256','RS384','RS512','ES256','ES384','ES512'].includes(header.alg)) {
        findings.push({ sev: 'low', text: `${header.alg} — secure` });
      } else { findings.push({ sev: 'high', text: `Unknown algorithm: ${header.alg}` }); score += 20; }

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp) {
        if (payload.exp < now) { findings.push({ sev: 'medium', text: `Expired ${now - payload.exp}s ago` }); score += 10; }
        else { findings.push({ sev: 'low', text: `Valid for ${payload.exp - now}s` }); }
      } else { findings.push({ sev: 'high', text: 'No exp claim' }); score += 20; }

      if (payload.iat) { findings.push({ sev: 'low', text: `Issued ${Math.floor((now - payload.iat) / 60)}m ago` }); }
      else { findings.push({ sev: 'medium', text: 'No iat claim' }); score += 10; }

      const missing = ['iss','aud','exp','iat'].filter(c => !(c in payload));
      if (missing.length) { findings.push({ sev: 'medium', text: `Missing: ${missing.join(', ')}` }); score += missing.length * 5; }

      if (payload.role || payload.admin || payload.isAdmin) {
        findings.push({ sev: 'medium', text: 'Contains role/permission claim' }); score += 5;
      }

      setResult({ header, payload, findings, score: Math.min(100, Math.max(0, score)) });
    } catch (e) {
      setError(e.message);
    }
  };

  const scoreColor = result?.score >= 70 ? 'text-red-400' : result?.score >= 40 ? 'text-orange-400' : result?.score >= 20 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="space-y-3">
      <textarea value={token} onChange={(e) => { setToken(e.target.value); setResult(null); }} placeholder="JWT Token..." rows={3}
        className="w-full bg-white/[0.03] border border-white/[0.08] text-green-400/80 text-xs font-mono rounded-lg px-3 py-2.5 outline-none focus:border-green-500/40 transition-colors placeholder:text-neutral-800 resize-none" />
      <button onClick={inspect} className="w-full py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors">
        Inspect
      </button>
      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${scoreColor}`}>{result.score}</span>
            <span className="text-[10px] font-mono text-neutral-600">/100 risk</span>
          </div>
          <div className="space-y-1">
            {result.findings.map((f, i) => (
              <div key={i} className={`text-[11px] font-mono px-2 py-1.5 rounded ${
                f.sev === 'critical' ? 'bg-red-500/[0.06] text-red-400' :
                f.sev === 'high' ? 'bg-orange-500/[0.06] text-orange-400' :
                f.sev === 'medium' ? 'bg-yellow-500/[0.06] text-yellow-400' :
                'bg-green-500/[0.06] text-green-400'
              }`}>
                <span className="uppercase text-[9px] mr-1.5">{f.sev}</span>{f.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Mini Generator ─────────────────────────────────────────────────
export const MiniGenerator = ({ onTokenGenerated }) => {
  const [header, setHeader] = useState(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
  const [payload, setPayload] = useState(JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: Math.floor(Date.now() / 1000) }, null, 2));
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const generate = async () => {
    setError('');
    setToken('');
    try {
      const h = JSON.parse(header);
      const p = JSON.parse(payload);
      const enc = new TextEncoder();
      const eh = base64UrlEncode(h);
      const ep = base64UrlEncode(p);
      const input = `${eh}.${ep}`;
      const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, enc.encode(input));
      const sigStr = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const full = `${input}.${sigStr}`;
      setToken(full);
      onTokenGenerated?.(full);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] font-mono text-neutral-600 uppercase mb-1">Header</p>
          <textarea value={header} onChange={(e) => setHeader(e.target.value)} rows={4} spellCheck={false}
            className="w-full bg-white/[0.03] border border-white/[0.08] text-green-400/80 text-[11px] font-mono rounded-lg px-3 py-2 outline-none resize-none focus:border-green-500/40 transition-colors" />
        </div>
        <div>
          <p className="text-[10px] font-mono text-neutral-600 uppercase mb-1">Payload</p>
          <textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={4} spellCheck={false}
            className="w-full bg-white/[0.03] border border-white/[0.08] text-yellow-400/80 text-[11px] font-mono rounded-lg px-3 py-2 outline-none resize-none focus:border-yellow-500/40 transition-colors" />
        </div>
      </div>
      <input type="text" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Secret key..."
        className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-xs font-mono rounded-lg px-3 py-2 outline-none focus:border-purple-500/40 transition-colors placeholder:text-neutral-700" />
      <button onClick={generate} className="w-full py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors">
        Generate Token
      </button>
      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
      {token && (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
          <p className="text-[10px] font-mono text-neutral-600 uppercase mb-1">Generated</p>
          <p className="text-[11px] font-mono text-neutral-400 break-all leading-relaxed">{token}</p>
          <button onClick={() => { navigator.clipboard.writeText(token); }} className="mt-2 text-[10px] font-mono text-green-400 hover:text-green-300 transition-colors">
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  );
};

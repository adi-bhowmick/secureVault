import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolModal from './ToolModal.jsx';
import { MiniDecoder, MiniVerifier, MiniInspector, MiniGenerator } from './MiniTools.jsx';

const decodeBase64Url = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return JSON.parse(atob(base64));
};

const formatJson = (obj) => JSON.stringify(obj, null, 2);

const WORDLIST = ['password', 'secret', '123456', 'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'qwerty', 'login', 'abc123', 'iloveyou', 'trustno1', 'sunshine'];

// ─── Weak Secret Challenge ──────────────────────────────────────────
const WeakSecretChallenge = ({ token }) => {
  const [wordlist, setWordlist] = useState(WORDLIST);
  const [customWord, setCustomWord] = useState('');
  const [testing, setTesting] = useState(null);
  const [found, setFound] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [results, setResults] = useState([]);

  let header, payload;
  try {
    const parts = token.split('.');
    header = decodeBase64Url(parts[0]);
    payload = decodeBase64Url(parts[1]);
  } catch { return <p className="text-red-400 text-sm">Invalid token</p>; }

  const testSecret = async (secret) => {
    setTesting(secret);
    setAttempts(a => a + 1);
    const encoder = new TextEncoder();
    const signingInput = `${token.split('.')[0]}.${token.split('.')[1]}`;

    try {
      const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput));
      const expected = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const match = expected === token.split('.')[2];
      setResults(r => [{ secret, match }, ...r]);
      if (match) setFound(secret);
    } catch {
      setResults(r => [{ secret, match: false }, ...r]);
    }
    setTesting(null);
  };

  const addWord = () => {
    if (customWord.trim() && !wordlist.includes(customWord.trim())) {
      setWordlist(w => [customWord.trim(), ...w]);
      setCustomWord('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Decoded token info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2">
          <p className="text-[10px] font-mono text-neutral-600 uppercase mb-1">Algorithm</p>
          <p className="text-sm font-mono text-green-400">{header.alg}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2">
          <p className="text-[10px] font-mono text-neutral-600 uppercase mb-1">Role</p>
          <p className="text-sm font-mono text-yellow-400">{payload.role || 'none'}</p>
        </div>
      </div>

      {/* Attack input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customWord}
          onChange={(e) => setCustomWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addWord()}
          placeholder="Add custom word to wordlist..."
          className="flex-1 bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono rounded-lg px-3 py-2 outline-none focus:border-green-500/40 transition-colors placeholder:text-neutral-700"
        />
        <button onClick={addWord} className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs font-mono text-neutral-400 hover:text-white hover:border-white/[0.15] transition-colors">
          Add
        </button>
      </div>

      {/* Wordlist attack */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
          <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">Wordlist Attack</span>
          <span className="text-[10px] font-mono text-neutral-700">{attempts} attempts</span>
        </div>
        <div className="p-3 max-h-[250px] overflow-y-auto space-y-1">
          {wordlist.map((w) => {
            const r = results.find(x => x.secret === w);
            return (
              <button
                key={w}
                onClick={() => !r && !found && testSecret(w)}
                disabled={!!r || !!found || testing === w}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                  r?.match ? 'bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400' :
                  r ? 'bg-white/[0.01] text-neutral-700' :
                  testing === w ? 'bg-yellow-500/[0.06] border border-yellow-500/20 text-yellow-400' :
                  'text-neutral-400 hover:bg-white/[0.03] hover:text-white border border-transparent'
                }`}
              >
                <span>{w}</span>
                {r?.match && <span className="text-xs">FOUND</span>}
                {r && !r.match && <svg className="w-3 h-3 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                {testing === w && <span className="text-xs text-yellow-400">testing...</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Found */}
      <AnimatePresence>
        {found && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-lg px-4 py-3"
          >
            <p className="text-sm text-emerald-400 font-medium">Secret cracked: <code className="font-mono bg-white/[0.06] px-1.5 py-0.5 rounded">{found}</code></p>
            <p className="text-xs text-neutral-500 mt-1">Now submit the flag to complete the challenge</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Expired Token Challenge ────────────────────────────────────────
const ExpiredTokenChallenge = ({ token }) => {
  const [decoded, setDecoded] = useState(null);

  try {
    if (!decoded) {
      const parts = token.split('.');
      setDecoded({
        header: decodeBase64Url(parts[0]),
        payload: decodeBase64Url(parts[1]),
      });
    }
  } catch { /* ignore */ }

  if (!decoded) return null;

  const now = Math.floor(Date.now() / 1000);
  const { payload } = decoded;
  const isExpired = payload.exp && payload.exp < now;
  const expiredAgo = isExpired ? now - payload.exp : 0;
  const expiresIn = !isExpired && payload.exp ? payload.exp - now : 0;

  return (
    <div className="space-y-4">
      {/* Expiration status */}
      <div className={`rounded-lg border px-4 py-3 ${isExpired ? 'bg-red-500/[0.06] border-red-500/20' : 'bg-emerald-500/[0.06] border-emerald-500/20'}`}>
        <div className="flex items-center gap-2">
          <svg className={`w-5 h-5 ${isExpired ? 'text-red-400' : 'text-emerald-400'}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className={`text-sm font-medium ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
            {isExpired ? `Expired ${expiredAgo}s ago` : `Valid for ${expiresIn}s`}
          </p>
        </div>
        <p className="text-xs text-neutral-500 mt-1 font-mono">
          exp: {new Date(payload.exp * 1000).toISOString()}
        </p>
      </div>

      {/* Timeline */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3">
        <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-3">Token Timeline</p>
        <div className="relative pl-4 space-y-3">
          <div className="absolute left-0 top-1 bottom-1 w-px bg-white/[0.06]" />
          <div className="relative">
            <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-blue-400 border-2 border-black" />
            <p className="text-xs text-neutral-400">Issued at</p>
            <p className="text-sm font-mono text-blue-400">{new Date(payload.iat * 1000).toLocaleString()}</p>
          </div>
          <div className="relative">
            <div className={`absolute -left-4 top-1.5 w-2 h-2 rounded-full border-2 border-black ${isExpired ? 'bg-red-400' : 'bg-yellow-400'}`} />
            <p className="text-xs text-neutral-400">Expires at</p>
            <p className={`text-sm font-mono ${isExpired ? 'text-red-400' : 'text-yellow-400'}`}>{new Date(payload.exp * 1000).toLocaleString()}</p>
          </div>
          <div className="relative">
            <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-green-400 border-2 border-black" />
            <p className="text-xs text-neutral-400">Now</p>
            <p className="text-sm font-mono text-green-400">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Payload breakdown */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-white/[0.04]">
          <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">Payload Claims</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {Object.entries(payload).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-mono text-neutral-500">{key}</span>
              <span className={`text-xs font-mono ${key === 'exp' ? (isExpired ? 'text-red-400' : 'text-yellow-400') : 'text-white'}`}>
                {typeof val === 'number' && key.includes('at') || key === 'exp' || key === 'iat' || key === 'nbf'
                  ? `${val} (${new Date(val * 1000).toLocaleDateString()})`
                  : String(val)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* What to do */}
      <div className="bg-yellow-500/[0.04] border border-yellow-500/15 rounded-lg px-4 py-3">
        <p className="text-[10px] font-mono text-yellow-500/60 uppercase tracking-wider mb-2">What to do</p>
        <ol className="space-y-1.5 text-xs text-neutral-400 list-decimal list-inside">
          <li>This token expired <span className="text-red-400 font-mono">{expiredAgo}s ago</span> — the server will reject it</li>
          <li>Use the <span className="text-white font-medium">Decoder Tool</span> to inspect the header and payload</li>
          <li>Notice the <code className="font-mono text-red-400 bg-white/[0.04] px-1 rounded">exp</code> claim is far in the past</li>
          <li>Think: what happens if you <span className="text-white font-medium">remove or modify</span> the <code className="font-mono text-red-400 bg-white/[0.04] px-1 rounded">exp</code> claim?</li>
          <li>Use the <span className="text-white font-medium">Generator Tool</span> to forge a new token with a future expiration</li>
        </ol>
      </div>

      <p className="text-xs text-neutral-500 text-center">Open the tools above to interact with this token</p>
    </div>
  );
};

// ─── Payload Tampering Challenge ────────────────────────────────────
const PayloadTamperingChallenge = ({ token, tokens }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  let givenParts, givenHeader, givenPayload;
  try {
    givenParts = token.split('.');
    givenHeader = decodeBase64Url(givenParts[0]);
    givenPayload = decodeBase64Url(givenParts[1]);
  } catch { return <p className="text-red-400 text-sm">Invalid token</p>; }

  let origParts, origHeader, origPayload;
  if (tokens?.original) {
    try {
      origParts = tokens.original.split('.');
      origHeader = decodeBase64Url(origParts[0]);
      origPayload = decodeBase64Url(origParts[1]);
    } catch { /* ignore */ }
  }

  const givenKeys = Object.keys(givenPayload);
  const origKeys = origPayload ? Object.keys(origPayload) : [];

  return (
    <div className="space-y-4">
      {/* Given token payload */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">Tampered Token Payload</p>
          </div>
          <span className="text-[10px] font-mono text-red-400">modified</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {givenKeys.map((key) => (
            <div key={key} className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-mono text-neutral-500">{key}</span>
              <span className={`text-xs font-mono ${key === 'role' ? 'text-red-400 font-bold' : 'text-white'}`}>
                {String(givenPayload[key])}
                {key === 'role' && ' ⚠️'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle original */}
      {origPayload && (
        <>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-mono text-neutral-500 hover:text-white transition-colors"
          >
            <svg className={`w-3 h-3 transition-transform ${showOriginal ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            {showOriginal ? 'Hide' : 'Show'} Original Token
          </button>

          <AnimatePresence>
            {showOriginal && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">Original Token Payload</p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">authentic</span>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {origKeys.map((key) => (
                      <div key={key} className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs font-mono text-neutral-500">{key}</span>
                        <span className={`text-xs font-mono ${key === 'role' ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                          {String(origPayload[key])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Diff hint */}
      <div className="bg-yellow-500/[0.04] border border-yellow-500/20 rounded-lg px-4 py-3">
        <p className="text-xs text-yellow-400">
          Compare the two payloads. One field has been changed. The signature of the tampered token is <code className="font-mono bg-white/[0.06] px-1 rounded">invalid_signature_here</code>
        </p>
      </div>
    </div>
  );
};

// ─── Role Escalation Challenge ──────────────────────────────────────
const RoleEscalationChallenge = ({ token }) => {
  const [secret, setSecret] = useState('');
  const [forgedToken, setForgedToken] = useState('');
  const [signing, setSigning] = useState(false);

  let header, payload;
  try {
    const parts = token.split('.');
    header = decodeBase64Url(parts[0]);
    payload = decodeBase64Url(parts[1]);
  } catch { return <p className="text-red-400 text-sm">Invalid token</p>; }

  const handleForge = async () => {
    if (!secret) return;
    setSigning(true);
    try {
      const newPayload = { ...payload, role: 'admin' };
      const enc = new TextEncoder();
      const base64UrlEncode = (data) => btoa(JSON.stringify(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const encodedHeader = base64UrlEncode(header);
      const encodedPayload = base64UrlEncode(newPayload);
      const signingInput = `${encodedHeader}.${encodedPayload}`;

      const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signingInput));
      const sigStr = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      setForgedToken(`${signingInput}.${sigStr}`);
    } catch (e) {
      setForgedToken('Error: ' + e.message);
    }
    setSigning(false);
  };

  return (
    <div className="space-y-4">
      {/* Current token */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3">
        <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-2">Current Token Payload</p>
        <div className="space-y-1">
          {Object.entries(payload).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-500">{k}</span>
              <span className={`text-xs font-mono ${k === 'role' ? 'text-yellow-400' : 'text-white'}`}>{String(v)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Forge form */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
        <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-3">Forge Admin Token</p>
        <div className="flex gap-2 mb-3">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter the weak secret..."
            className="flex-1 bg-white/[0.03] border border-white/[0.08] text-white text-sm font-mono rounded-lg px-3 py-2 outline-none focus:border-purple-500/40 transition-colors placeholder:text-neutral-700"
          />
          <button
            onClick={handleForge}
            disabled={!secret || signing}
            className="px-4 py-2 bg-purple-500/[0.08] border border-purple-500/20 text-purple-400 text-xs font-mono rounded-lg hover:bg-purple-500/[0.12] transition-colors disabled:opacity-40"
          >
            {signing ? 'Signing...' : 'Forge'}
          </button>
        </div>
        <p className="text-xs text-neutral-600">The payload will be modified to <code className="font-mono text-yellow-400">role: "admin"</code> and re-signed</p>
      </div>

      {/* Forged result */}
      <AnimatePresence>
        {forgedToken && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/[0.04] border border-emerald-500/20 rounded-lg p-4"
          >
            <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-2">Forged Token</p>
            <p className="text-xs font-mono text-emerald-400 break-all leading-relaxed bg-white/[0.02] border border-white/[0.04] rounded p-3">
              {forgedToken}
            </p>
            <p className="text-xs text-neutral-500 mt-2">Verify this token in the Token Inspector to confirm the role is now "admin"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Signature Verification Challenge ───────────────────────────────
const SignatureVerificationChallenge = ({ token }) => {
  let header, payload;
  try {
    const parts = token.split('.');
    header = decodeBase64Url(parts[0]);
    payload = decodeBase64Url(parts[1]);
  } catch { return <p className="text-red-400 text-sm">Invalid token</p>; }

  return (
    <div className="space-y-4">
      {/* Algorithm alert */}
      <div className="bg-red-500/[0.06] border border-red-500/20 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.375c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-400 font-medium">Critical: "none" Algorithm Detected</p>
        </div>
        <p className="text-xs text-neutral-400 mt-1">This token uses <code className="font-mono text-red-400">alg: "none"</code> — no cryptographic signature is required</p>
      </div>

      {/* Token breakdown */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/[0.04]">
          <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">Token Structure</p>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-[10px] font-mono text-green-400 mb-1">Header</p>
            <pre className="text-xs font-mono text-neutral-300 bg-white/[0.02] rounded p-2">{formatJson(header)}</pre>
          </div>
          <div>
            <p className="text-[10px] font-mono text-yellow-400 mb-1">Payload</p>
            <pre className="text-xs font-mono text-neutral-300 bg-white/[0.02] rounded p-2">{formatJson(payload)}</pre>
          </div>
          <div>
            <p className="text-[10px] font-mono text-purple-400 mb-1">Signature</p>
            <p className="text-xs font-mono text-neutral-600 bg-white/[0.02] rounded p-2">(empty — no signature)</p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3">
        <p className="text-xs text-neutral-400 leading-relaxed">
          When <code className="font-mono text-red-400">alg: "none"</code>, some JWT libraries skip signature verification entirely.
          This means you can create a token with <strong className="text-white">any payload</strong> and the server will accept it.
          The token above has <code className="font-mono text-yellow-400">role: "admin"</code> with no valid signature.
        </p>
      </div>

      <p className="text-xs text-neutral-500 text-center">Read the explanation to learn how to forge your own none-algorithm token</p>
    </div>
  );
};

// ─── Main Challenge Component ───────────────────────────────────────
const LabChallenge = ({ slug, token, tokens }) => {
  const [activeModal, setActiveModal] = useState(null);

  const tools = [
    { id: 'decoder', label: 'Decoder', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg> },
    { id: 'verifier', label: 'Verifier', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg> },
    { id: 'inspector', label: 'Inspector', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'generator', label: 'Generator', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg> },
  ];

  const challenges = {
    'weak-secret': <WeakSecretChallenge token={token} />,
    'expired-token': <ExpiredTokenChallenge token={token} />,
    'payload-tampering': <PayloadTamperingChallenge token={token} tokens={tokens} />,
    'role-escalation': <RoleEscalationChallenge token={token} />,
    'signature-verification': <SignatureVerificationChallenge token={token} />,
  };

  return (
    <>
      {/* Tool bar — prominent */}
      <div className="bg-gradient-to-r from-green-500/[0.04] to-emerald-500/[0.02] border border-green-500/10 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.18A1.125 1.125 0 014.5 17.29V5.71a1.125 1.125 0 011.536-1.06l5.384 3.18a1.125 1.125 0 010 1.94z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5l4.5-2.625v14.25L16.5 16.5" />
          </svg>
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Lab Tools</span>
          <span className="text-[10px] font-mono text-neutral-600">— click to open</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveModal(t.id)}
              className="group flex flex-col items-center gap-2 px-3 py-3.5 bg-black/40 border border-white/[0.06] rounded-lg hover:border-green-500/30 hover:bg-green-500/[0.06] transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:border-green-500/20 group-hover:bg-green-500/[0.08] flex items-center justify-center transition-all">
                <span className="text-neutral-500 group-hover:text-green-400 transition-colors">{t.icon}</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-500 group-hover:text-green-400 transition-colors">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Challenge */}
      {challenges[slug] || null}

      {/* Modals */}
      <ToolModal open={activeModal === 'decoder'} onClose={() => setActiveModal(null)} title="JWT Decoder"
        icon={<svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>}>
        <MiniDecoder initialToken={token} />
      </ToolModal>

      <ToolModal open={activeModal === 'verifier'} onClose={() => setActiveModal(null)} title="Token Verifier"
        icon={<svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}>
        <MiniVerifier initialToken={token} />
      </ToolModal>

      <ToolModal open={activeModal === 'inspector'} onClose={() => setActiveModal(null)} title="Token Inspector"
        icon={<svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
        <MiniInspector initialToken={token} />
      </ToolModal>

      <ToolModal open={activeModal === 'generator'} onClose={() => setActiveModal(null)} title="Token Generator"
        icon={<svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}>
        <MiniGenerator />
      </ToolModal>
    </>
  );
};

export default LabChallenge;

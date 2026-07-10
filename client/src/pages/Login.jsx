import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const GlowOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} />
);

const InputField = ({ label, type, value, onChange, required, minLength, placeholder }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-mono text-neutral-500 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
      placeholder={placeholder}
      className="w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 text-sm
        placeholder:text-neutral-700 outline-none
        focus:border-green-500/40 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(0,255,65,0.06)]
        transition-all duration-300"
    />
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <GlowOrb className="w-[500px] h-[500px] bg-green-500/[0.06] top-[-150px] left-1/2 -translate-x-1/2" />
      <GlowOrb className="w-[300px] h-[300px] bg-emerald-500/[0.04] bottom-0 right-0" />

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-white/[0.04]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <span className="text-black text-xs font-bold font-mono">SV</span>
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">secureVault</span>
        </Link>
      </nav>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mt-12"
      >
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-green-500/15 to-transparent" />
        <div className="relative bg-black/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs text-neutral-600 font-mono">auth/login</span>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
              <p className="text-sm text-neutral-500 mt-1.5">Sign in to your account</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-lg mb-6 text-sm font-mono"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-medium py-2.5 rounded-lg text-sm
                  hover:bg-neutral-200 transition-all duration-300
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
              <p className="text-sm text-neutral-500">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

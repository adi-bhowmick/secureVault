import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.98 ? '#fff' : '#00ff4188';
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 opacity-20 pointer-events-none"
    />
  );
};

const NeonGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />
    </div>
  );
};

const GlowOrb = ({ className }) => (
  <div
    className={`absolute rounded-full blur-[120px] ${className}`}
  />
);

const TerminalCursor = () => (
  <span className="inline-block w-[2px] h-[1em] bg-green-400 ml-1 animate-pulse" />
);

const TypeWriter = ({ text, speed = 50, delay = 0 }) => {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && <TerminalCursor />}
    </span>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="relative group"
  >
    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 h-full hover:border-green-500/20 transition-colors duration-500">
      <div className="text-3xl mb-4 text-green-400 font-mono">{icon}</div>
      <h3 className="text-white font-medium text-lg mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const features = [
  { icon: '{ }', title: 'JWT Decoder', description: 'Decode and inspect JSON Web Tokens in real-time with syntax highlighting.' },
  { icon: '></>', title: 'Token Generator', description: 'Generate custom JWT tokens with configurable claims and signatures.' },
  { icon: '[ ]', title: 'Token Verifier', description: 'Verify JWT signatures, expiration, and validate token integrity.' },
  { icon: '>>>', title: 'Security Labs', description: 'Hands-on security challenges to master JWT vulnerabilities.' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <MatrixRain />
      <NeonGrid />

      <GlowOrb className="w-[600px] h-[600px] bg-green-500/[0.07] top-[-200px] left-1/2 -translate-x-1/2" />
      <GlowOrb className="w-[400px] h-[400px] bg-emerald-500/[0.05] bottom-0 left-0" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <span className="text-black text-xs font-bold font-mono">SV</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">secureVault</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-neutral-400 hover:text-white transition-colors px-4 py-2"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 border border-green-500/20 rounded-full px-4 py-1.5 mb-8 bg-green-500/[0.05]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-mono">v2.0 — Security Labs Now Live</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]"
        >
          <span className="bg-gradient-to-b from-white via-white to-neutral-600 bg-clip-text text-transparent">
            Master JWT
          </span>
          <br />
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Security
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-lg"
        >
          <p className="text-neutral-400 text-lg leading-relaxed">
            Decode, generate, and verify JWT tokens.
            <br />
            Learn security through hands-on labs.
          </p>
        </motion.div>

        {/* Terminal Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-12 w-full max-w-2xl"
        >
          <div className="relative rounded-xl border border-white/[0.08] bg-black/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-green-500/[0.05]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-neutral-600 font-mono">terminal</span>
            </div>
            <div className="p-5 font-mono text-sm text-left space-y-1">
              <div className="text-neutral-500">
                <span className="text-green-400">$</span>{' '}
                <TypeWriter text="npx secure-vault decode eyJhbGci..." delay={800} speed={35} />
              </div>
              <div className="text-neutral-500 opacity-0" style={{ animation: 'fadeIn 0.3s 2.5s forwards' }}>
                <span className="text-yellow-400">header</span>{' '}
                <span className="text-neutral-600">=</span> {'{ "alg": "HS256", "typ": "JWT" }'}
              </div>
              <div className="text-neutral-500 opacity-0" style={{ animation: 'fadeIn 0.3s 3s forwards' }}>
                <span className="text-yellow-400">payload</span>{' '}
                <span className="text-neutral-600">=</span> {'{ "sub": "user_1", "exp": 1718... }'}
              </div>
              <div className="text-neutral-500 opacity-0" style={{ animation: 'fadeIn 0.3s 3.5s forwards' }}>
                <span className="text-green-400">✓</span>{' '}
                <span className="text-green-400/80">Token decoded successfully</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex items-center gap-4"
        >
          <Link
            to="/register"
            className="bg-white text-black px-6 py-3 rounded-lg font-medium text-sm hover:bg-neutral-200 transition-all hover:shadow-lg hover:shadow-white/10"
          >
            Start Building
          </Link>
          <Link
            to="/dashboard"
            className="border border-white/[0.1] text-neutral-300 px-6 py-3 rounded-lg font-medium text-sm hover:bg-white/[0.03] hover:border-white/[0.15] transition-all"
          >
            View Dashboard
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-mono text-green-400 tracking-widest uppercase mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-6 lg:px-12 py-20 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '500+', label: 'Tokens Decoded' },
            { value: '50+', label: 'Security Labs' },
            { value: '99.9%', label: 'Uptime' },
            { value: '<50ms', label: 'Response Time' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl font-bold bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs text-neutral-600 mt-1 font-mono">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-neutral-500 text-lg mb-8">
            Join developers building secure applications with JWT.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-lg font-medium hover:bg-neutral-200 transition-all hover:shadow-lg hover:shadow-white/10"
          >
            Get Started
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 lg:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <span className="text-black text-[8px] font-bold font-mono">SV</span>
            </div>
            <span className="text-xs text-neutral-600 font-mono">secureVault</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-neutral-600">
            <a href="#" className="hover:text-neutral-400 transition-colors">GitHub</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">Docs</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

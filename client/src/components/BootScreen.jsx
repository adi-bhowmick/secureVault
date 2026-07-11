import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bootLines = [
  { text: '> Initializing secureVault kernel...', delay: 0 },
  { text: '> Bypassing firewall [████████████] 100%', delay: 400 },
  { text: '> Loading JWT exploit modules...', delay: 800 },
  { text: '> Establishing encrypted tunnel...', delay: 1200 },
  { text: '> Scanning for vulnerabilities... 14 found', delay: 1600 },
  { text: '> Injecting payload... done', delay: 2000 },
  { text: '> Access granted. Welcome, operator.', delay: 2400 },
];

const MatrixRain = () => {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]|;:,.<>?/~`';
    const columns = 30;
    const initial = Array.from({ length: columns }, (_, i) => ({
      id: i,
      x: (i / columns) * 100,
      chars: Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]),
      speed: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.3,
    }));
    setDrops(initial);

    const interval = setInterval(() => {
      setDrops(prev =>
        prev.map(d => ({
          ...d,
          chars: [...d.chars.slice(1), chars[Math.floor(Math.random() * chars.length)]],
          opacity: Math.min(d.opacity + 0.02, 0.4),
        }))
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map(drop => (
        <div
          key={drop.id}
          className="absolute text-[10px] font-mono leading-[14px] text-green-500/20"
          style={{
            left: `${drop.x}%`,
            top: '10%',
            opacity: drop.opacity,
            animation: `fall ${drop.speed}s linear infinite`,
          }}
        >
          {drop.chars.map((c, i) => (
            <div key={i} style={{ opacity: 1 - i * 0.12 }}>{c}</div>
          ))}
        </div>
      ))}
    </div>
  );
};

const BootScreen = ({ onComplete }) => {
  const [visibleLines, setVisibleLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [showMain, setShowMain] = useState(false);

  useEffect(() => {
    bootLines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, line.text]);
      }, line.delay);
    });

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    setTimeout(() => setShowMain(true), 3200);
    setTimeout(() => onComplete(), 3800);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!showMain && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        >
          <MatrixRain />

          <div className="relative z-10 w-full max-w-lg px-6">
            {/* ASCII art header */}
            <div className="mb-6 text-center">
              <pre className="text-green-500/60 text-[10px] sm:text-xs font-mono leading-tight select-none">
{` ____  ___  __  __  ___  ____  ____  _  _
/ ___)/ __)(  \\/  )/ __)(  _ \\(  _ \\( \\/ )
\\___ \\(__ \\ )    ( \\__ \\ )   / )   / \\  /
(____/(____/(_/\\_)(____/(_)\\_)(__)  (__)`}
              </pre>
            </div>

            {/* Terminal window */}
            <div className="bg-black/80 border border-green-500/20 rounded-lg overflow-hidden backdrop-blur-sm">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-green-500/10">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="ml-2 text-[10px] font-mono text-green-500/40">secureVault@root:~</span>
              </div>

              {/* Terminal body */}
              <div className="p-4 min-h-[220px] font-mono text-xs space-y-1.5">
                {visibleLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-green-400/80"
                  >
                    {line}
                  </motion.div>
                ))}

                {/* Blinking cursor */}
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-green-400/80">$</span>
                  <span className="w-2 h-4 bg-green-400/60 animate-pulse" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-4 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-green-500/40">SYSTEM BOOT</span>
                  <span className="text-[10px] font-mono text-green-500/60">{progress}%</span>
                </div>
                <div className="w-full h-1 bg-green-500/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom text */}
            <p className="text-center text-[10px] font-mono text-green-500/20 mt-4">
              JWTLab v2.0.0 — authorized access only
            </p>
          </div>

          <style>{`
            @keyframes fall {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(500%); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootScreen;

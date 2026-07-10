import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
      {/* Neon grid — top-right corner, fading midway */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Coarse grid */}
        <div
          className="absolute -top-10 -right-10 w-[1000px] h-[1000px]"
          style={{
            opacity: 0.25,
            backgroundImage: `
              linear-gradient(rgba(0,255,65,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,65,0.8) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 80% 75% at 90% 10%, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 75% at 90% 10%, black 30%, transparent 75%)',
          }}
        />
        {/* Fine grid */}
        <div
          className="absolute -top-10 -right-10 w-[1000px] h-[1000px]"
          style={{
            opacity: 0.15,
            backgroundImage: `
              linear-gradient(rgba(0,255,65,0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,65,0.6) 1px, transparent 1px)
            `,
            backgroundSize: '16px 16px',
            maskImage: 'radial-gradient(ellipse 80% 75% at 90% 10%, black 25%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 75% at 90% 10%, black 25%, transparent 70%)',
          }}
        />
        {/* Gradient black veil — pulls back to reveal more grid */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(155deg, transparent 0%, transparent 35%, rgba(0,0,0,0.6) 55%, black 70%)',
          }}
        />
      </div>

      {/* Glow orbs */}
      <div className="fixed top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-green-500/[0.04] blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-200px] left-[-100px] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-[150px] pointer-events-none" />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

import { useAuth } from '../context/AuthContext.jsx';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-8 relative z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-neutral-500 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 w-64 focus-within:border-green-500/30 transition-colors">
          <svg className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-700 outline-none w-full"
          />
          <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono text-neutral-700 border border-white/[0.06] rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.06]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400/80 to-emerald-600 flex items-center justify-center">
            <span className="text-black text-[11px] font-bold font-mono">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-neutral-400 text-sm hidden sm:inline font-mono">{user?.username}</span>
        </div>
        <button
          onClick={logout}
          className="text-neutral-600 hover:text-red-400 text-xs font-mono transition-colors px-2 py-1 rounded hover:bg-red-500/[0.05]"
        >
          logout()
        </button>
      </div>
    </header>
  );
};

export default Navbar;

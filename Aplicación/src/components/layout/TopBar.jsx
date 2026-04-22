export default function TopBar() {
  return (
    <header className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50">
      {/* Logo mobile */}
      <div className="flex items-center gap-3 md:hidden">
        <span className="material-symbols-outlined text-neon-cyan">cell_tower</span>
        <span className="text-xl font-black text-white tracking-tighter">AeroSense</span>
      </div>

      {/* Logo desktop */}
      <div className="hidden md:block">
        <span className="text-xl font-black text-white tracking-tighter">AeroSense IoT</span>
      </div>

      {/* Acciones de la derecha */}
      <div className="flex items-center gap-4">
        {/* Search bar — solo desktop */}
        <div className="hidden md:flex relative group">
          <input
            type="text"
            placeholder="Buscar sensores, logs..."
            className="bg-surface-container-high border border-outline-variant text-slate-200 rounded-full py-1.5 pl-4 pr-10 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all w-64 text-body-sm placeholder:text-slate-500"
          />
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-neon-cyan">
            search
          </span>
        </div>

        {/* Notificaciones */}
        <button className="text-slate-400 hover:text-slate-200 hover:bg-white/5 p-2 rounded-full transition-all active:scale-95 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-2 w-2 h-2 bg-neon-orange rounded-full" />
        </button>

        {/* Settings */}
        <button className="text-slate-400 hover:text-slate-200 hover:bg-white/5 p-2 rounded-full transition-all active:scale-95">
          <span className="material-symbols-outlined">settings</span>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full border-2 border-slate-700 bg-gradient-to-br from-neon-purple/40 to-neon-cyan/40 flex items-center justify-center ml-1">
          <span className="text-xs font-bold text-white">AN</span>
        </div>
      </div>
    </header>
  );
}

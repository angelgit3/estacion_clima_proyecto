const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', active: true },
  { icon: 'sensors', label: 'Sensores' },
  { icon: 'insights', label: 'Analíticas' },
  { icon: 'terminal', label: 'System Logs' },
];

export default function Sidebar({ stationName = 'Station Alpha-1', isOnline = false, temperature }) {
  return (
    <nav className="hidden md:flex flex-col bg-slate-950/80 backdrop-blur-2xl h-screen w-64 border-r border-white/5 fixed left-0 top-0 z-40">
      {/* Encabezado con identidad de la estación */}
      <div className="p-6 border-b border-white/5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-neon-cyan text-xl">cell_tower</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 leading-none">{stationName}</h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-neon-emerald animate-pulse' : 'bg-red-500'}`} />
            {isOnline ? 'Online' : 'Offline'}
            {temperature != null && <span className="ml-1">• {temperature.toFixed(1)}°C</span>}
          </p>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <a
                href="#"
                className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 group ${
                  item.active
                    ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-neon-cyan border-l-4 border-neon-cyan font-semibold'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="text-label-bold uppercase">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer con acciones secundarias */}
      <div className="p-4 border-t border-white/5 space-y-3">
        <button className="w-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan py-2 rounded-lg text-label-bold hover:bg-neon-cyan/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            add_circle
          </span>
          Deploy New Node
        </button>
        <div className="flex gap-4 text-slate-500 justify-center">
          <a href="#" className="hover:text-slate-300 transition-colors">
            <span className="material-symbols-outlined">help</span>
          </a>
          <a href="#" className="hover:text-slate-300 transition-colors">
            <span className="material-symbols-outlined">logout</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

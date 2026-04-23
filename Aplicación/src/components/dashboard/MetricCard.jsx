const TREND_ICONS = {
  up: 'trending_up',
  down: 'trending_down',
  stable: 'trending_flat',
};

const ACCENT_MAP = {
  orange: 'text-brand-warning',
  cyan: 'text-brand-info',
  emerald: 'text-brand-success',
  purple: 'text-brand-secondary',
  skyblue: 'text-brand-primary',
};

const BG_ACCENT_MAP = {
  orange: 'bg-brand-warning',
  cyan: 'bg-brand-info',
  emerald: 'bg-brand-success',
  purple: 'bg-brand-secondary',
  skyblue: 'bg-brand-primary',
};

export default function MetricCard({ title, value, unit, icon, accent, trend, progress }) {
  const accentColorClass = ACCENT_MAP[accent];
  const bgAccentClass = BG_ACCENT_MAP[accent];
  const accentBorderClass = `metric-accent-${accent}`;

  return (
    <div
      className={`glass-panel ${accentBorderClass} p-7 flex flex-col justify-between hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 ease-out group`}
    >
      {/* Header: título + icono */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
        <div className={`p-2 rounded-xl transition-colors duration-300 ${bgAccentClass} bg-opacity-10 group-hover:bg-opacity-20`}>
          <span
            className={`material-symbols-outlined text-xl block ${accentColorClass}`}
          >
            {icon}
          </span>
        </div>
      </div>

      {/* Valor principal */}
      <div>
        <div className="text-display-metrics text-slate-900 flex items-baseline">
          {value != null ? value : '--'}
          {unit && <span className="text-xl font-medium text-slate-400 ml-1.5">{unit}</span>}
        </div>

        {/* Barra de progreso (ej: ruido) */}
        {progress && (
          <div className="mt-5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className={`${bgAccentClass} h-full rounded-full transition-all duration-700 ease-in-out`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-500 mt-2 block">{progress.label}</span>
          </div>
        )}

        {/* Tendencia */}
        {trend && !progress && (
          <div className={`flex items-center gap-1.5 ${accentColorClass} mt-3 text-sm font-bold`}>
            <span className="material-symbols-outlined text-base">{TREND_ICONS[trend.direction]}</span>
            {trend.direction === 'stable' ? (
              <span className="opacity-70">Estable</span>
            ) : (
              <span className="tracking-wide">
                {trend.delta > 0 ? '+' : ''}
                {trend.delta}/hr
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

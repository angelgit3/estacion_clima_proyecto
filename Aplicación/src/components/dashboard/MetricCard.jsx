const TREND_ICONS = {
  up: 'trending_up',
  down: 'trending_down',
  stable: 'trending_flat',
};

/**
 * Tarjeta de métrica individual con glassmorphism y acento de color.
 *
 * @param {object} props
 * @param {string} props.title     — nombre del sensor
 * @param {string|number} props.value — valor numérico principal
 * @param {string} props.unit      — unidad de medida
 * @param {string} props.icon      — nombre del Material Symbol
 * @param {'orange'|'cyan'|'emerald'|'purple'|'skyblue'} props.accent
 * @param {{ direction: string, delta: number }} [props.trend]
 * @param {{ percent: number, label: string }} [props.progress] — barra de progreso opcional
 */
export default function MetricCard({ title, value, unit, icon, accent, trend, progress }) {
  const accentColorClass = `text-neon-${accent}`;
  const accentBorderClass = `metric-accent-${accent}`;

  return (
    <div
      className={`glass-panel ${accentBorderClass} p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300`}
    >
      {/* Header: título + icono */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-label-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <span
          className={`material-symbols-outlined ${accentColorClass}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>

      {/* Valor principal */}
      <div>
        <div className="text-display-metrics text-white">
          {value != null ? value : '--'}
          {unit && <span className="text-2xl text-slate-500 ml-1">{unit}</span>}
        </div>

        {/* Barra de progreso (ej: ruido) */}
        {progress && (
          <div className="mt-3">
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className={`bg-neon-${accent} h-1.5 rounded-full transition-all duration-500`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 mt-1 block">{progress.label}</span>
          </div>
        )}

        {/* Tendencia */}
        {trend && !progress && (
          <div className={`flex items-center gap-1 ${accentColorClass} mt-2 text-sm`}>
            <span className="material-symbols-outlined text-sm">{TREND_ICONS[trend.direction]}</span>
            {trend.direction === 'stable' ? (
              'Estable'
            ) : (
              <span>
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

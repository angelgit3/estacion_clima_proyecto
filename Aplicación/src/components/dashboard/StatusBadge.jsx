const COLOR_MAP = {
  emerald: 'bg-brand-success text-brand-success border-brand-success/20',
  orange: 'bg-brand-warning text-brand-warning border-brand-warning/20',
  cyan: 'bg-brand-info text-brand-info border-brand-info/20',
  purple: 'bg-brand-secondary text-brand-secondary border-brand-secondary/20',
};

const DOT_COLOR_MAP = {
  emerald: 'bg-brand-success',
  orange: 'bg-brand-warning',
  cyan: 'bg-brand-info',
  purple: 'bg-brand-secondary',
};

export default function StatusBadge({ label, color = 'emerald', icon, pulse = false }) {
  const colorClasses = COLOR_MAP[color] || COLOR_MAP.emerald;
  const dotClass = DOT_COLOR_MAP[color] || DOT_COLOR_MAP.emerald;

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border bg-opacity-5 text-[11px] font-black uppercase tracking-widest ${colorClasses}`}
    >
      {icon ? (
        <span className="material-symbols-outlined text-base">{icon}</span>
      ) : (
        <span className={`w-2 h-2 rounded-full shadow-sm ${dotClass} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {label}
    </div>
  );
}

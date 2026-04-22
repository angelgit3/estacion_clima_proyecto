/**
 * Pill de estado (ej: "Wi-Fi Stable", "MPU6500 OK").
 *
 * @param {object} props
 * @param {string} props.label
 * @param {'cyan'|'emerald'|'orange'|'purple'} props.color
 * @param {string} [props.icon] — Material Symbol opcional
 * @param {boolean} [props.pulse] — animar el punto indicador
 */
export default function StatusBadge({ label, color = 'emerald', icon, pulse = false }) {
  return (
    <div
      className={`flex items-center gap-2 bg-neon-${color}/10 text-neon-${color} px-3 py-1.5 rounded-full border border-neon-${color}/30 text-label-bold`}
    >
      {icon ? (
        <span className="material-symbols-outlined text-sm">{icon}</span>
      ) : (
        <span className={`w-2 h-2 rounded-full bg-neon-${color} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {label}
    </div>
  );
}

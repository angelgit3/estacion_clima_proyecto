const RANGOS = ['1H', '24H', '7D', '30D'];

/**
 * Selector de rango de tiempo para las gráficas históricas.
 *
 * @param {object} props
 * @param {string} props.activo — rango actualmente seleccionado
 * @param {(rango: string) => void} props.onChange
 */
export default function TimeRangeSelector({ activo, onChange }) {
  return (
    <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/5">
      {RANGOS.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-4 py-1.5 rounded-md text-label-bold transition-colors ${
            r === activo
              ? 'bg-slate-700 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

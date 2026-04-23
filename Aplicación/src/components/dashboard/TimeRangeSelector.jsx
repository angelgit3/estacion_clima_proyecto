const RANGOS = ['1H', '24H', '7D', '30D'];

export default function TimeRangeSelector({ activo, onChange }) {
  return (
    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
      {RANGOS.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all duration-300 ${
            r === activo
              ? 'bg-white text-slate-900 shadow-md'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

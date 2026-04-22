import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatearFecha } from '../../lib/calculations';

/** Tooltip custom con glassmorphism */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-panel px-4 py-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">{formatearFecha(label, 'datetime')}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          <span className="font-semibold">{entry.name}:</span> {entry.value?.toFixed(1)} {entry.unit}
        </p>
      ))}
    </div>
  );
}

/**
 * Gráfica de área con gradientes para el historial de datos.
 *
 * @param {object} props
 * @param {Array} props.data — array de mediciones del historial
 * @param {string} props.rango — rango activo para formatear el eje X
 */
export default function HistoricalChart({ data = [], rango = '24H' }) {
  if (!data.length) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl mb-2 block">query_stats</span>
          <p>Sin datos históricos para este rango</p>
        </div>
      </div>
    );
  }

  // Determinar formato del eje X según el rango
  const formatoX = rango === '7D' || rango === '30D' ? 'date' : 'time';

  // Muestrear datos si hay demasiados puntos (evitar lag)
  const MAX_PUNTOS = 200;
  const dataMuestreada =
    data.length > MAX_PUNTOS
      ? data.filter((_, i) => i % Math.ceil(data.length / MAX_PUNTOS) === 0)
      : data;

  return (
    <ResponsiveContainer width="100%" height={288}>
      <AreaChart data={dataMuestreada} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradHum" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

        <XAxis
          dataKey="fecha_rtc"
          tickFormatter={(v) => formatearFecha(v, formatoX)}
          stroke="#475569"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
        />

        <YAxis
          yAxisId="temp"
          stroke="#475569"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
          domain={['auto', 'auto']}
        />

        <YAxis
          yAxisId="hum"
          orientation="right"
          stroke="#475569"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
          domain={[0, 100]}
          hide
        />

        <Tooltip content={<CustomTooltip />} />

        <Legend
          iconType="line"
          wrapperStyle={{ color: '#94a3b8', fontSize: '12px', paddingTop: '8px' }}
        />

        <Area
          yAxisId="temp"
          type="monotone"
          dataKey="temperatura_bme"
          name="Temperatura"
          unit="°C"
          stroke="#fb923c"
          strokeWidth={2}
          fill="url(#gradTemp)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#fb923c', fill: '#0f172a' }}
        />

        <Area
          yAxisId="hum"
          type="monotone"
          dataKey="humedad"
          name="Humedad"
          unit="%"
          stroke="#22d3ee"
          strokeWidth={2}
          fill="url(#gradHum)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#22d3ee', fill: '#0f172a' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

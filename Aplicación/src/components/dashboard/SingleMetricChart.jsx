import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatearFecha } from '../../lib/calculations';

/** Tooltip custom con glassmorphism */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const data = payload[0];

  return (
    <div className="glass-panel px-4 py-3 shadow-xl border border-white/10">
      <p className="text-xs text-slate-400 mb-2">{formatearFecha(label, 'datetime')}</p>
      <p className="text-sm font-semibold" style={{ color: data.color }}>
        {data.name}: {data.value?.toFixed(1)} {data.unit}
      </p>
    </div>
  );
}

/**
 * Gráfica de área genérica para un solo sensor.
 *
 * @param {object} props
 * @param {Array} props.data — array de mediciones
 * @param {string} props.dataKey — clave del objeto a graficar (ej: 'temperatura_bme')
 * @param {string} props.name — nombre legible (ej: 'Temperatura')
 * @param {string} props.unit — unidad (ej: '°C')
 * @param {string} props.color — color hex (ej: '#fb923c')
 * @param {string} props.rango — '1H', '24H', etc. (para el formato del eje X)
 * @param {Array} [props.domain] — dominio del eje Y, default ['auto', 'auto']
 */
export default function SingleMetricChart({
  data = [],
  dataKey,
  name,
  unit,
  color,
  rango = '24H',
  domain = ['auto', 'auto'],
}) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <span className="material-symbols-outlined text-3xl mb-1 block">query_stats</span>
          <p className="text-sm">Sin datos</p>
        </div>
      </div>
    );
  }

  // Determinar formato del eje X
  const formatoX = rango === '7D' || rango === '30D' ? 'date' : 'time';

  // Calcular el dominio de tiempo exacto para que la gráfica no se estire
  const RANGO_A_HORAS = {
    '1H': 1,
    '24H': 24,
    '7D': 24 * 7,
    '30D': 24 * 30,
  };
  const horas = RANGO_A_HORAS[rango] || 24;
  const now = Date.now();
  const startTime = now - horas * 60 * 60 * 1000;
  const endTime = now;

  // Muestrear datos y agregar timestamp numérico para el eje X
  const MAX_PUNTOS = 150;
  const dataMuestreada =
    data.length > MAX_PUNTOS
      ? data.filter((_, i) => i % Math.ceil(data.length / MAX_PUNTOS) === 0)
      : data;
      
  const dataConTimestamp = dataMuestreada.map(d => ({
    ...d,
    timestamp: new Date(d.fecha_rtc).getTime()
  }));

  // ID único para el gradiente basado en el dataKey
  const gradId = `grad_${dataKey}`;

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dataConTimestamp} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={[startTime, endTime]}
            tickFormatter={(v) => formatearFecha(v, formatoX)}
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={10}
            // Agregamos un tick count dinámico para que no se amontonen las horas
            tickCount={6}
          />

          <YAxis
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={domain}
            tickFormatter={(v) => Math.round(v)}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }} />

          <Area
            type="monotone"
            dataKey={dataKey}
            name={name}
            unit={unit}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: color, fill: '#0f172a' }}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

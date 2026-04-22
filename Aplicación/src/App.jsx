import { useMemo, useState } from 'react';
import { useStationData } from './hooks/useStationData';
import { pulsosAViento, categorizarRuido, calcularTendencia } from './lib/calculations';

import MetricCard from './components/dashboard/MetricCard';
import StatusBadge from './components/dashboard/StatusBadge';
import SingleMetricChart from './components/dashboard/SingleMetricChart';
import TimeRangeSelector from './components/dashboard/TimeRangeSelector';

import './index.css';

const SENSORS = [
  { id: 'temperatura_bme', label: 'Temperatura', icon: 'thermostat', unit: '°C', color: '#fb923c', domain: ['auto', 'auto'] },
  { id: 'humedad', label: 'Humedad', icon: 'humidity_percentage', unit: '%', color: '#22d3ee', domain: [0, 100] },
  { id: 'presion', label: 'Presión', icon: 'compress', unit: 'hPa', color: '#34d399', domain: ['auto', 'auto'] },
  { id: 'nivel_ruido', label: 'Ruido', icon: 'volume_up', unit: 'dB', color: '#a855f7', domain: ['auto', 'auto'] },
  { id: 'viento_kmh', label: 'Viento', icon: 'air', unit: 'km/h', color: '#38bdf8', domain: [0, 'auto'] },
];

export default function App() {
  const [sensorActivo, setSensorActivo] = useState(SENSORS[0]);
  const {
    ultimaLectura,
    lecturaPrevia,
    historial,
    rango,
    setRango,
    cargando,
    conectado,
  } = useStationData('24H');

  // Derivar métricas a partir de las lecturas crudas
  const temp = ultimaLectura?.temperatura_bme;
  const hum = ultimaLectura?.humedad;
  const pres = ultimaLectura?.presion;
  const ruido = ultimaLectura?.nivel_ruido;
  const pulsos = ultimaLectura?.viento_pulsos;
  const rssi = ultimaLectura?.rssi_wifi;

  const vientoKmh = pulsosAViento(pulsos);
  const nivelRuido = categorizarRuido(ruido);

  const tendenciaTemp = calcularTendencia(temp, lecturaPrevia?.temperatura_bme);
  const tendenciaHum = calcularTendencia(hum, lecturaPrevia?.humedad);
  const tendenciaPres = calcularTendencia(pres, lecturaPrevia?.presion);

  const wifiEstable = rssi != null && rssi > -80;

  // Procesar historial para agregar viento_kmh para la gráfica
  const historialProcesado = useMemo(() => {
    return historial.map((d) => ({
      ...d,
      viento_kmh: pulsosAViento(d.viento_pulsos),
    }));
  }, [historial]);

  return (
    <main className="w-full min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-[#020617] p-4 md:p-8 overflow-y-auto">
      
      {/* Header Simplificado */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50 shadow-inner">
            <span className="material-symbols-outlined text-neon-skyblue text-2xl block">
              podcasts
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Estación de Meteoros
              <span className={`w-2 h-2 rounded-full ${conectado ? 'bg-neon-emerald animate-pulse' : 'bg-red-500'}`} />
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Station Alpha-1 <span className="mx-1">•</span> Telemetría en vivo
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <StatusBadge
            label={wifiEstable ? 'Wi-Fi Estable' : 'Wi-Fi Débil'}
            color={wifiEstable ? 'emerald' : 'orange'}
            pulse={wifiEstable}
          />
          <StatusBadge
            label="MPU6500 OK"
            color="cyan"
            icon="memory"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Skeleton de carga */}
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-panel p-6 h-40 animate-pulse">
                <div className="h-3 bg-slate-700 rounded w-24 mb-6" />
                <div className="h-10 bg-slate-700 rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          /* Grid de Métricas en Vivo */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-10">
            <MetricCard
              title="Temperatura"
              value={temp?.toFixed(1)}
              unit="°C"
              icon="thermostat"
              accent="orange"
              trend={tendenciaTemp}
            />
            <MetricCard
              title="Humedad"
              value={hum?.toFixed(0)}
              unit="%"
              icon="humidity_percentage"
              accent="cyan"
              trend={tendenciaHum}
            />
            <MetricCard
              title="Presión"
              value={pres?.toFixed(0)}
              unit="hPa"
              icon="compress"
              accent="emerald"
              trend={tendenciaPres}
            />
            <MetricCard
              title="Ruido Ambiental"
              value={ruido?.toFixed(0)}
              unit="dB"
              icon="volume_up"
              accent="purple"
              progress={nivelRuido}
            />
            <MetricCard
              title="Vel. Viento"
              value={vientoKmh.toFixed(1)}
              unit="km/h"
              icon="air"
              accent="skyblue"
              trend={{
                direction: vientoKmh > 0 ? 'up' : 'stable',
                delta: vientoKmh > 0 ? parseFloat(vientoKmh.toFixed(1)) : 0,
              }}
            />
          </div>
        )}

        {/* Sección de Gráficas Históricas */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Analíticas por Sensor</h2>
            <p className="text-slate-400 text-sm">Evolución detallada en el tiempo</p>
          </div>
          <TimeRangeSelector activo={rango} onChange={setRango} />
        </div>

        {/* Tabs de Sensores y Gráfica Activa */}
        <div className="glass-panel p-5">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'temperatura_bme', label: 'Temperatura', icon: 'thermostat', unit: '°C', color: '#fb923c', domain: ['auto', 'auto'] },
              { id: 'humedad', label: 'Humedad', icon: 'humidity_percentage', unit: '%', color: '#22d3ee', domain: [0, 100] },
              { id: 'presion', label: 'Presión', icon: 'compress', unit: 'hPa', color: '#34d399', domain: ['auto', 'auto'] },
              { id: 'nivel_ruido', label: 'Ruido', icon: 'volume_up', unit: 'dB', color: '#a855f7', domain: ['auto', 'auto'] },
              { id: 'viento_kmh', label: 'Viento', icon: 'air', unit: 'km/h', color: '#38bdf8', domain: [0, 'auto'] },
            ].map(sensor => (
              <button
                key={sensor.id}
                onClick={() => setSensorActivo(sensor)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                  ${sensorActivo.id === sensor.id 
                    ? 'bg-slate-700/80 text-white shadow-lg border border-slate-600' 
                    : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300 border border-transparent'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ color: sensorActivo.id === sensor.id ? sensor.color : '' }}>
                  {sensor.icon}
                </span>
                {sensor.label}
              </button>
            ))}
          </div>

          <div className="mt-2">
            <h3 className="text-slate-300 font-semibold mb-4 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg" style={{ color: sensorActivo.color }}>
                {sensorActivo.icon}
              </span>
              Evolución de {sensorActivo.label}
            </h3>
            <div className="h-72">
              <SingleMetricChart
                data={historialProcesado}
                dataKey={sensorActivo.id}
                name={sensorActivo.label}
                unit={sensorActivo.unit}
                color={sensorActivo.color}
                rango={rango}
                domain={sensorActivo.domain}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

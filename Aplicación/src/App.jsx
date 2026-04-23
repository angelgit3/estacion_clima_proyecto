import { useMemo, useState } from 'react';
import { useStationData } from './hooks/useStationData';
import { pulsosAViento, categorizarRuido, calcularTendencia } from './lib/calculations';

import MetricCard from './components/dashboard/MetricCard';
import StatusBadge from './components/dashboard/StatusBadge';
import SingleMetricChart from './components/dashboard/SingleMetricChart';
import TimeRangeSelector from './components/dashboard/TimeRangeSelector';

import './index.css';

const SENSORS = [
  { id: 'temperatura_bme', label: 'Temperatura', icon: 'device_thermostat', unit: '°C', color: '#f59e0b', domain: ['auto', 'auto'] },
  { id: 'humedad', label: 'Humedad', icon: 'water_drop', unit: '%', color: '#06b6d4', domain: [0, 100] },
  { id: 'presion', label: 'Presión', icon: 'speed', unit: 'hPa', color: '#10b981', domain: ['auto', 'auto'] },
  { id: 'nivel_ruido', label: 'Ruido', icon: 'graphic_eq', unit: 'dB', color: '#6366f1', domain: ['auto', 'auto'] },
  { id: 'viento_kmh', label: 'Viento', icon: 'air', unit: 'km/h', color: '#0ea5e9', domain: [0, 'auto'] },
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
    <main className="w-full min-h-screen relative overflow-hidden p-4 md:p-8 overflow-y-auto selection:bg-brand-primary/20">
      
      {/* Header Premium */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-brand-primary/10 border border-slate-100">
            <span className="material-symbols-outlined text-brand-primary text-3xl block">
              wb_sunny
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              SkyVision Pro
              <span className={`w-3 h-3 rounded-full shadow-lg ${conectado ? 'bg-brand-success shadow-brand-success/50 animate-pulse' : 'bg-red-500 shadow-red-500/50'}`} />
            </h1>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-[2px] bg-brand-primary" />
              Sonda Meteorológica V2.0
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <StatusBadge
            label={wifiEstable ? 'Conexión Segura' : 'Señal Intermitente'}
            color={wifiEstable ? 'emerald' : 'orange'}
            pulse={wifiEstable}
          />
          <StatusBadge
            label="Inercial Activo"
            color="cyan"
            icon="auto_mode"
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
            <h2 className="text-2xl font-black text-slate-900">Analíticas Avanzadas</h2>
            <p className="text-slate-500 text-sm font-medium">Visualización de series temporales</p>
          </div>
          <TimeRangeSelector activo={rango} onChange={setRango} />
        </div>

        {/* Tabs de Sensores y Gráfica Activa */}
        <div className="glass-panel p-5">
          <div className="flex flex-wrap gap-3 mb-8">
            {SENSORS.map(sensor => (
              <button
                key={sensor.id}
                onClick={() => setSensorActivo(sensor)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-500
                  ${sensorActivo.id === sensor.id 
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-105' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ color: sensorActivo.id === sensor.id ? sensor.color : '' }}>
                  {sensor.icon}
                </span>
                {sensor.label}
              </button>
            ))}
          </div>

          <div className="mt-2">
            <h3 className="text-slate-800 font-bold mb-6 text-base flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: `${sensorActivo.color}20` }}>
                <span className="material-symbols-outlined text-lg" style={{ color: sensorActivo.color }}>
                  {sensorActivo.icon}
                </span>
              </div>
              Dinámica de {sensorActivo.label}
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

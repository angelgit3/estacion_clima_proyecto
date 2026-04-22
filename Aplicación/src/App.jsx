import { useStationData } from './hooks/useStationData';
import { pulsosAViento, categorizarRuido, calcularTendencia } from './lib/calculations';

import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import MetricCard from './components/dashboard/MetricCard';
import StatusBadge from './components/dashboard/StatusBadge';
import HistoricalChart from './components/dashboard/HistoricalChart';
import TimeRangeSelector from './components/dashboard/TimeRangeSelector';

import './index.css';

export default function App() {
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

  // Estado Wi-Fi
  const wifiEstable = rssi != null && rssi > -80;

  return (
    <>
      <Sidebar
        stationName="Station Alpha-1"
        isOnline={conectado}
        temperature={temp}
      />

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-[#020617]">
        <TopBar />

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {/* Header del dashboard */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-headline-lg text-white mb-2">Telemetría en Vivo</h2>
              <p className="text-body-lg text-slate-400">
                Flujo de datos en tiempo real desde Station Alpha-1.
              </p>
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

          {/* Skeleton de carga */}
          {cargando ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="glass-panel p-6 h-40 animate-pulse">
                  <div className="h-3 bg-slate-700 rounded w-24 mb-6" />
                  <div className="h-10 bg-slate-700 rounded w-20" />
                </div>
              ))}
            </div>
          ) : (
            /* Grid de métricas */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
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

          {/* Gráfica Histórica */}
          <div className="glass-panel p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-headline-md text-white">Analíticas Históricas</h3>
                <p className="text-body-sm text-slate-400">Tendencias ambientales a lo largo del tiempo.</p>
              </div>
              <TimeRangeSelector activo={rango} onChange={setRango} />
            </div>
            <HistoricalChart data={historial} rango={rango} />
          </div>
        </div>
      </main>
    </>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const TABLA = 'mediciones';

/** Mapea rangos de UI a intervalos de horas para la query */
const RANGO_A_HORAS = {
  '1H': 1,
  '24H': 24,
  '7D': 168,
  '30D': 720,
};

/**
 * Hook que encapsula toda la lógica de datos de la estación:
 * - Fetch de la última lectura
 * - Fetch del historial según rango de tiempo
 * - Suscripción Realtime (WebSocket) para INSERT nuevos
 *
 * @param {string} rangoInicial — '1H' | '24H' | '7D' | '30D'
 */
export function useStationData(rangoInicial = '24H') {
  const [ultimaLectura, setUltimaLectura] = useState(null);
  const [lecturaPrevia, setLecturaPrevia] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [rango, setRango] = useState(rangoInicial);
  const [cargando, setCargando] = useState(true);
  const [conectado, setConectado] = useState(false);
  const [error, setError] = useState(null);
  const canalRef = useRef(null);

  /** Trae la lectura más reciente de la tabla */
  const fetchUltimaLectura = useCallback(async () => {
    const { data, error: err } = await supabase
      .from(TABLA)
      .select('*')
      .order('fecha_rtc', { ascending: false })
      .limit(2);

    if (err) {
      setError(err.message);
      return;
    }
    if (data?.length > 0) {
      setUltimaLectura(data[0]);
      if (data.length > 1) setLecturaPrevia(data[1]);
    }
  }, []);

  /** Trae el historial según el rango seleccionado */
  const fetchHistorial = useCallback(async (rangoActual) => {
    const horas = RANGO_A_HORAS[rangoActual] || 24;
    const desde = new Date(Date.now() - horas * 60 * 60 * 1000).toISOString();

    const { data, error: err } = await supabase
      .from(TABLA)
      .select('fecha_rtc, temperatura_bme, humedad, presion, nivel_ruido, viento_pulsos, rssi_wifi')
      .gte('fecha_rtc', desde)
      .order('fecha_rtc', { ascending: true });

    if (err) {
      setError(err.message);
      return;
    }
    setHistorial(data || []);
  }, []);

  /** Carga inicial: última lectura + historial */
  useEffect(() => {
    async function init() {
      setCargando(true);
      setError(null);
      await Promise.all([fetchUltimaLectura(), fetchHistorial(rango)]);
      setCargando(false);
    }
    init();
  }, [fetchUltimaLectura, fetchHistorial, rango]);

  /** Suscripción Realtime — se ejecuta UNA vez al montar */
  useEffect(() => {
    const canal = supabase
      .channel('mediciones-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLA },
        (payload) => {
          const nuevo = payload.new;
          setUltimaLectura((prev) => {
            setLecturaPrevia(prev);
            return nuevo;
          });
          setHistorial((prev) => [...prev, nuevo]);
        }
      )
      .subscribe((status) => {
        setConectado(status === 'SUBSCRIBED');
      });

    canalRef.current = canal;

    return () => {
      if (canalRef.current) {
        supabase.removeChannel(canalRef.current);
      }
    };
  }, []);

  return {
    ultimaLectura,
    lecturaPrevia,
    historial,
    rango,
    setRango,
    cargando,
    conectado,
    error,
  };
}

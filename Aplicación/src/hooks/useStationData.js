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
      .order('created_at', { ascending: false })
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
      .select('created_at, fecha_rtc, temperatura_bme, humedad, presion, nivel_ruido, viento_pulsos, rssi_wifi')
      .gte('created_at', new Date(Date.now() - 720 * 60 * 60 * 1000).toISOString()) 
      // CLAVE: Ordenamos DESCENDENTE para que Supabase nos traiga SIEMPRE los datos más nuevos primero, 
      // evitando que el límite de 1000 filas nos entierre la data viva debajo de los datos semilla.
      .order('created_at', { ascending: false })
      .limit(2000);

    if (err) {
      setError(err.message);
      return;
    }

    // Como pedimos descendente para no perder los nuevos, acá lo volvemos a invertir
    const dataInvertida = (data || []).reverse();

    // 1. Normalizar fechas
    // El ESP32 tiene un bug: lee la hora local (UTC-6) pero la envía con una 'Z' al final, 
    // lo que hace que Supabase crea que es UTC y la retrase 6 horas.
    // También puede fallar el NTP y mandar 1970.
    const dataNormalizada = dataInvertida.map(row => {
      let fechaCorregida = row.fecha_rtc;
      
      if (fechaCorregida && fechaCorregida.startsWith('1970')) {
        fechaCorregida = row.created_at; // Falla de NTP
      } else if (row.created_at && row.fecha_rtc) {
        // Si la diferencia entre created_at y fecha_rtc es casi exactamente 6 horas (bug de zona horaria del ESP32)
        const diffHoras = (new Date(row.created_at) - new Date(row.fecha_rtc)) / (1000 * 60 * 60);
        if (diffHoras > 5.5 && diffHoras < 6.5) {
          fechaCorregida = row.created_at; // Usamos el created_at que es perfectamente UTC
        }
      }

      return { ...row, fecha_rtc: fechaCorregida };
    });

    // 2. Ordenar cronológicamente por la fecha que realmente se va a graficar
    dataNormalizada.sort((a, b) => new Date(a.fecha_rtc) - new Date(b.fecha_rtc));

    // 3. Filtrar estrictamente por el rango seleccionado en la UI
    const dataFiltrada = dataNormalizada.filter(row => new Date(row.fecha_rtc) >= new Date(desde));

    setHistorial(dataFiltrada);
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
          let nuevo = payload.new;
          
          // Parche NTP y Zona Horaria para Realtime
          let fechaCorregida = nuevo.fecha_rtc;
          if (fechaCorregida && fechaCorregida.startsWith('1970')) {
            fechaCorregida = nuevo.created_at;
          } else if (nuevo.created_at && nuevo.fecha_rtc) {
            const diffHoras = (new Date(nuevo.created_at) - new Date(nuevo.fecha_rtc)) / (1000 * 60 * 60);
            if (diffHoras > 5.5 && diffHoras < 6.5) {
              fechaCorregida = nuevo.created_at;
            }
          }
          nuevo = { ...nuevo, fecha_rtc: fechaCorregida };

          setUltimaLectura((prev) => {
            setLecturaPrevia(prev);
            return nuevo;
          });
          setHistorial((prev) => {
            // Filtrar y ordenar para que la gráfica no se vuelva loca
            const combinado = [...prev, nuevo];
            combinado.sort((a, b) => new Date(a.fecha_rtc) - new Date(b.fecha_rtc));
            return combinado;
          });
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

/**
 * Conversiones y fórmulas de sensores.
 *
 * Radio de giro del anemómetro: 12.5 cm (0.125 m)
 * Imanes por vuelta: 1
 * Fórmula: V(km/h) = (pulsos_por_minuto × 2π × 0.125 × 60) / 1000
 */

const RADIO_GIRO = 0.125; // metros

/**
 * Convierte pulsos crudos del anemómetro a km/h.
 *
 * @param {number} pulsos      — conteo de pulsos en el intervalo
 * @param {number} intervaloSeg — duración del intervalo en segundos (default 60)
 * @returns {number} velocidad en km/h
 */
export function pulsosAViento(pulsos, intervaloSeg = 60) {
  if (!pulsos || pulsos <= 0) return 0;
  const pulsosPorMinuto = (pulsos / intervaloSeg) * 60;
  return (pulsosPorMinuto * 2 * Math.PI * RADIO_GIRO * 60) / 1000;
}

/**
 * Categoriza el nivel de ruido en un rango humano.
 *
 * @param {number} nivel — valor crudo del sensor
 * @returns {{ label: string, percent: number }}
 */
export function categorizarRuido(nivel) {
  if (nivel == null || nivel <= 0) return { label: 'Sin datos', percent: 0 };
  if (nivel < 40) return { label: 'Silencioso', percent: Math.round((nivel / 120) * 100) };
  if (nivel < 70) return { label: 'Moderado', percent: Math.round((nivel / 120) * 100) };
  return { label: 'Ruidoso', percent: Math.min(100, Math.round((nivel / 120) * 100)) };
}

/**
 * Calcula la tendencia entre dos valores.
 *
 * @param {number} actual   — valor más reciente
 * @param {number} anterior — valor previo
 * @returns {{ direction: 'up'|'down'|'stable', delta: number }}
 */
export function calcularTendencia(actual, anterior) {
  if (actual == null || anterior == null) return { direction: 'stable', delta: 0 };
  const delta = actual - anterior;
  const umbral = 0.1;
  if (Math.abs(delta) < umbral) return { direction: 'stable', delta: 0 };
  return { direction: delta > 0 ? 'up' : 'down', delta: parseFloat(delta.toFixed(2)) };
}

/**
 * Formatea un timestamp ISO a hora local legible.
 *
 * @param {string} iso — string ISO 8601
 * @param {'time'|'datetime'|'date'} formato
 * @returns {string}
 */
export function formatearFecha(iso, formato = 'time') {
  if (!iso) return '--:--';
  const d = new Date(iso);
  const opciones = {
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    date: { month: 'short', day: 'numeric' },
  };
  return d.toLocaleString('es-MX', opciones[formato] || opciones.time);
}

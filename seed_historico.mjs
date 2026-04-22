import { createClient } from '@supabase/supabase-js';

// ==========================================
// CONFIGURACIÓN (Llenar estos datos)
// ==========================================
// 1. Tus credenciales de Supabase
const SUPABASE_URL = 'https://koxiobqhwvfkomiqxbor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveGlvYnFod3Zma29taXF4Ym9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTY5OTMsImV4cCI6MjA5MjM3Mjk5M30.SDobTZQ7EaRlNHPpEO5XjTP-QDSKMeEhgrTxCTo0-dw'; 

// 2. Tus coordenadas decimales (20°04'32.8"N 98°24'02.2"W)
const LATITUDE = '20.07577'; 
const LONGITUDE = '-98.40061';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedData() {
  console.log('Iniciando script sembrador...');
  console.log('Descargando datos climáticos reales de los últimos 5 días...');

  // Usamos Open-Meteo porque es gratis y no pide API Key
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&past_days=5&hourly=temperature_2m,relative_humidity_2m,surface_pressure`;

  try {
    const response = await fetch(url);
    const apiData = await response.json();

    const times = apiData.hourly.time;
    const temps = apiData.hourly.temperature_2m;
    const hums = apiData.hourly.relative_humidity_2m;
    const pressures = apiData.hourly.surface_pressure;

    const rowsToInsert = [];
    
    // Calculamos el límite de "ayer" (hace 24 horas)
    const limiteAyer = new Date();
    limiteAyer.setHours(limiteAyer.getHours() - 24);

    // Iteramos hasta el penúltimo para poder interpolar con la siguiente hora
    for (let i = 0; i < times.length - 1; i++) {
      const fechaBase = new Date(times[i]);
      if (fechaBase > new Date()) continue; // Ignorar futuros

      // Generar 60 datos por cada hora (uno por minuto)
      for (let min = 0; min < 60; min++) {
        const fechaMedicion = new Date(fechaBase.getTime() + min * 60000);
        if (fechaMedicion > new Date()) break;

        // Interpolar (Temp, Hum, Presion)
        const ratio = min / 60.0;
        let tempInt = temps[i] + (temps[i+1] - temps[i]) * ratio;
        let humInt = hums[i] + (hums[i+1] - hums[i]) * ratio;
        let presInt = pressures[i] + (pressures[i+1] - pressures[i]) * ratio;

        // Añadir micro-variaciones (ruido realista) para que no sea una línea recta perfecta
        tempInt += (Math.random() * 0.2) - 0.1; // +/- 0.1°C
        humInt += (Math.random() * 1.0) - 0.5;   // +/- 0.5%
        presInt += (Math.random() * 0.4) - 0.2;  // +/- 0.2hPa

        let ruido = 0;
        let viento = 0;
        
        if (fechaMedicion >= limiteAyer) {
          ruido = Math.floor(Math.random() * (75 - 45 + 1)) + 45; // Ruido
          // Viento: rachas aleatorias. A veces 0, a veces sube.
          viento = Math.random() > 0.6 ? Math.floor(Math.random() * 40) : 0; 
        }

        rowsToInsert.push({
          fecha_rtc: fechaMedicion.toISOString(),
          temperatura_bme: parseFloat(tempInt.toFixed(2)),
          humedad: parseFloat(humInt.toFixed(2)),
          presion: parseFloat(presInt.toFixed(2)),
          nivel_ruido: ruido,
          viento_pulsos: viento,
          rssi_wifi: -Math.floor(Math.random() * (65 - 50 + 1) + 50),
          accel_x: 0, accel_y: 0, accel_z: 1,
          gyro_x: 0, gyro_y: 0, gyro_z: 0
        });
      }
    }

    console.log(`Preparando ${rowsToInsert.length} filas para insertar en Supabase (Bloques de 1000)...`);

    // Supabase permite insertar máximo ~1000 a la vez por tamaño de payload, partimos el arreglo
    const chunkSize = 1000;
    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
      const chunk = rowsToInsert.slice(i, i + chunkSize);
      const { error } = await supabase.from('mediciones').insert(chunk);
      if (error) {
        console.error('Error inyectando a Supabase:', error);
      } else {
        console.log(`Insertadas ${i + chunk.length} de ${rowsToInsert.length}...`);
      }
    }

    console.log('¡ÉXITO! Base de datos rellenada con historial masivo.');

  } catch (err) {
    console.error('Error fatal:', err);
  }
}

seedData();

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

    for (let i = 0; i < times.length; i++) {
      // Ignorar datos futuros
      const fechaMedicion = new Date(times[i]);
      if (fechaMedicion > new Date()) continue;

      // Lógica de la excusa: 
      // Antes de ayer -> Solo BME280.
      // Desde ayer -> BME280 + Ruido + Viento.
      let ruido = 0;
      let viento = 0;
      
      if (fechaMedicion >= limiteAyer) {
        // Datos falsos aleatorios para simular que "ayer" conectaron el resto
        ruido = Math.floor(Math.random() * (80 - 40 + 1)) + 40; // Ruido entre 40 y 80
        viento = Math.floor(Math.random() * 50); // Pulsos de viento aleatorios
      }

      rowsToInsert.push({
        fecha_rtc: fechaMedicion.toISOString(),
        temperatura_bme: temps[i],
        humedad: hums[i],
        presion: pressures[i],
        nivel_ruido: ruido,
        viento_pulsos: viento,
        rssi_wifi: -Math.floor(Math.random() * (70 - 40 + 1) + 40), // -40 a -70 dBm
        accel_x: 0, accel_y: 0, accel_z: 1, // MPU estático
        gyro_x: 0, gyro_y: 0, gyro_z: 0
      });
    }

    console.log(`Preparando ${rowsToInsert.length} filas para insertar en Supabase...`);

    // Supabase permite insertar en bloques (batches)
    const { data, error } = await supabase
      .from('mediciones')
      .insert(rowsToInsert);

    if (error) {
      console.error('Error inyectando a Supabase:', error);
    } else {
      console.log('¡ÉXITO! Base de datos rellenada. El historial está listo.');
    }

  } catch (err) {
    console.error('Error fatal:', err);
  }
}

seedData();

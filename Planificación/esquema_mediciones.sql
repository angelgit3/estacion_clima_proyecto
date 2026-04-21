CREATE TABLE mediciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  fecha_rtc timestamptz,

  -- Sensores Climatológicos
  temperatura_bme float4,
  humedad float4,
  presion float4,
  temp_externa float4, -- DS18B20
  nivel_luz float4,
  viento_pulsos int4,

  -- Sensores de Estado y Entorno
  nivel_ruido float4,
  rssi_wifi int4,      -- Intensidad de señal Wi-Fi (dBm)

  -- Datos Inerciales (MPU6500)
  accel_x float4, accel_y float4, accel_z float4,
  gyro_x float4, gyro_y float4, gyro_z float4
);

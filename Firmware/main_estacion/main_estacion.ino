#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <Adafruit_MPU6050.h>
#include <driver/i2s.h>
#include <time.h>
#include <ArduinoJson.h> // Necesitas instalar esta librería en el gestor

// ==========================================
// CONFIGURACIÓN DE RED Y SUPABASE
// ==========================================
const char* ssid = "wawos";
const char* password = "463728195";

// Supabase (Reemplaza ANON_KEY con la clave "anon/public" de tu dashboard)
const String supabase_url = "https://koxiobqhwvfkomiqxbor.supabase.co/rest/v1/mediciones";
const String supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveGlvYnFod3Zma29taXF4Ym9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTY5OTMsImV4cCI6MjA5MjM3Mjk5M30.SDobTZQ7EaRlNHPpEO5XjTP-QDSKMeEhgrTxCTo0-dw"; 

// ==========================================
// PINES Y CONFIGURACIÓN DE SENSORES
// ==========================================
// BME280 & MPU6500 (I2C Compartido)
#define SDA_PIN 21
#define SCL_PIN 22
Adafruit_BME280 bme;
Adafruit_MPU6050 mpu;

// INMP441 (Micrófono I2S)
#define I2S_WS 25
#define I2S_SCK 26
#define I2S_SD 33
#define I2S_PORT I2S_NUM_0
#define bufferLen 64
int32_t sBuffer[bufferLen];
float nivelRuidoAcumulado = 0;
long muestrasRuido = 0;

// KY-003 (Anemómetro)
#define PIN_ANEMOMETRO 27
volatile unsigned long conteoViento = 0;
void IRAM_ATTR contarPulsoViento() {
  conteoViento++;
}

// Temporizadores (millis)
unsigned long tiempoAnterior = 0;
const unsigned long intervaloEnvio = 60000; // Enviar cada 60 segundos (ajustable)

// ==========================================
// INICIALIZACIÓN
// ==========================================
void setup() {
  Serial.begin(115200);
  
  // 1. Iniciar Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado a la red Wi-Fi!");

  // 2. Sincronizar NTP (UTC 0) para base de datos
  // Usamos offset 0 porque Supabase espera ISO8601 en formato UTC ('Z')
  configTime(0, 0, "pool.ntp.org"); 
  Serial.println("Sincronizando reloj con NTP (UTC)...");

  // 3. Iniciar I2C
  Wire.begin(SDA_PIN, SCL_PIN);
  
  // 4. Iniciar BME280
  if (!bme.begin(0x76, &Wire) && !bme.begin(0x77, &Wire)) {
    Serial.println("Error: No se encontró el BME280");
  } else {
    Serial.println("BME280 iniciado.");
  }

  // 5. Iniciar MPU6500 (Forzado a 0x69)
  if (!mpu.begin(0x69, &Wire)) {
    Serial.println("Error: No se encontró el MPU6500 en 0x69");
  } else {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("MPU6500 iniciado.");
  }

  // 6. Iniciar Anemómetro (Interrupción)
  pinMode(PIN_ANEMOMETRO, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_ANEMOMETRO), contarPulsoViento, FALLING);
  Serial.println("Anemómetro iniciado.");

  // 7. Iniciar Micrófono I2S
  const i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 44100,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = i2s_comm_format_t(I2S_COMM_FORMAT_I2S | I2S_COMM_FORMAT_I2S_MSB),
    .intr_alloc_flags = 0,
    .dma_buf_count = 8,
    .dma_buf_len = bufferLen,
    .use_apll = false
  };
  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  const i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK, .ws_io_num = I2S_WS, .data_out_num = -1, .data_in_num = I2S_SD
  };
  i2s_set_pin(I2S_PORT, &pin_config);
  i2s_start(I2S_PORT);
  Serial.println("Micrófono I2S iniciado.");
  Serial.println("==== SISTEMA LISTO ====");
}

// ==========================================
// LOOP PRINCIPAL
// ==========================================
void loop() {
  // --- 1. Lectura continua del micrófono (Audio no puede bloquearse) ---
  size_t bytesIn = 0;
  esp_err_t result = i2s_read(I2S_PORT, &sBuffer, bufferLen * sizeof(int32_t), &bytesIn, portMAX_DELAY);
  if (result == ESP_OK) {
    int samples_read = bytesIn / sizeof(int32_t);
    for (int i = 0; i < samples_read; i++) {
      int32_t raw = sBuffer[i] >> 14; // Limpiamos bits bajos
      nivelRuidoAcumulado += abs(raw);
      muestrasRuido++;
    }
  }

  // --- 2. Tarea temporizada (Envío a Supabase) ---
  unsigned long tiempoActual = millis();
  if (tiempoActual - tiempoAnterior >= intervaloEnvio) {
    tiempoAnterior = tiempoActual;

    // Obtener datos
    float temp = bme.readTemperature();
    float hum = bme.readHumidity();
    float pres = bme.readPressure() / 100.0F;

    sensors_event_t a, g, temp_mpu;
    mpu.getEvent(&a, &g, &temp_mpu);

    // Leer y reiniciar contador del anemómetro de forma segura
    noInterrupts();
    unsigned long pulsosViento = conteoViento;
    conteoViento = 0;
    interrupts();

    // Calcular promedio de ruido
    float ruidoPromedio = 0;
    if (muestrasRuido > 0) {
      ruidoPromedio = nivelRuidoAcumulado / muestrasRuido;
    }
    nivelRuidoAcumulado = 0;
    muestrasRuido = 0;

    int rssi = WiFi.RSSI();

    // Obtener fecha/hora NTP ISO8601
    struct tm timeinfo;
    char timeString[30] = "1970-01-01T00:00:00Z";
    if(getLocalTime(&timeinfo)){
      strftime(timeString, sizeof(timeString), "%Y-%m-%dT%H:%M:%S.000Z", &timeinfo);
    }

    Serial.println("\n--- Enviando Datos ---");
    Serial.printf("Temp: %.2fC, Hum: %.2f%%, Viento: %lu pulsos, Ruido: %.2f\n", temp, hum, pulsosViento, ruidoPromedio);

    // Preparar JSON
    StaticJsonDocument<512> doc;
    doc["fecha_rtc"] = timeString;
    doc["temperatura_bme"] = temp;
    doc["humedad"] = hum;
    doc["presion"] = pres;
    doc["viento_pulsos"] = pulsosViento;
    doc["nivel_ruido"] = ruidoPromedio;
    doc["rssi_wifi"] = rssi;
    doc["accel_x"] = a.acceleration.x;
    doc["accel_y"] = a.acceleration.y;
    doc["accel_z"] = a.acceleration.z;
    doc["gyro_x"] = g.gyro.x;
    doc["gyro_y"] = g.gyro.y;
    doc["gyro_z"] = g.gyro.z;
    // temp_externa y nivel_luz no se envían, la DB los pondrá como NULL automáticamente.

    String jsonString;
    serializeJson(doc, jsonString);

    // Enviar a Supabase
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(supabase_url);
      http.addHeader("Content-Type", "application/json");
      http.addHeader("apikey", supabase_anon_key);
      http.addHeader("Authorization", "Bearer " + supabase_anon_key);
      http.addHeader("Prefer", "return=minimal");

      int httpResponseCode = http.POST(jsonString);
      
      if (httpResponseCode > 0) {
        Serial.printf("HTTP Response code: %d\n", httpResponseCode);
      } else {
        Serial.printf("Error HTTP: %s\n", http.errorToString(httpResponseCode).c_str());
      }
      http.end();
    } else {
      Serial.println("Error: Wi-Fi desconectado.");
    }
  }
}

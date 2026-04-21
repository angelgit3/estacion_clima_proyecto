/*
 * =====================================================================================
 * PROYECTO: ESTACIÓN METEOROLÓGICA (Pruebas Individuales)
 * SENSOR:   INMP441 (Micrófono MEMS Digital Omnidireccional - I2S)
 * =====================================================================================
 * 
 * ¿CÓMO CONECTARLO AL ESP32?
 * -------------------------------------------------------------------------------------
 * VDD -> 3.3V
 * GND -> GND
 * L/R -> GND (Para designar que el micro envíe los datos por el canal Izquierdo/Left)
 * WS  -> GPIO 25 (LRC/Word Select, reloj que distingue canales stereo)
 * SCK -> GPIO 26 (BCLK, reloj de bits serial)
 * SD  -> GPIO 33 (DIN, Datos digitales)
 * 
 * EXPLICACIÓN Y LÓGICA:
 * Muestrear audio con calidad usando entradas analógicas normales (ADC) satura al microprocesador.
 * Por eso usamos el bus "I2S", un protocolo por hardware hecho específicamente para Audio de alta fidelidad.
 * El procesador lee pedazos gigantes de memoria en segundo plano gracias al controlador I2S directo.
 * En esta prueba vamos a graficar "volumen/ruido". En el Arduino IDE, puedes ir a 
 * Herramientas > Serial Plotter (Plóter Serial) ¡para ver las ondas gráficas de tu voz!
 * 
 * IMPORTANTE: ¡ESTO TIENE QUE IR RÁPIDO PARA MEDIR SONIDO, EL RETARDO SERÁ NULO!
 * =====================================================================================
 */

#include <driver/i2s.h> // Esta librería ya viene integrada con el nucleo del ESP32

// Definición de Puertos Hardware para el I2S
#define I2S_WS 25
#define I2S_SD 33
#define I2S_SCK 26

// Puerto de I2S (el ESP32 tiene el 0 y el 1)
#define I2S_PORT I2S_NUM_0

// Buffer tamaño de muestras para atrapar sonido de forma masiva
#define bufferLen 64
int16_t sBuffer[bufferLen];

void i2s_install() {
  // Configuración técnica espartana del driver de Audio I2S
  const i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX), // ESP32 es Maestro y RX (Recibe datos)
    .sample_rate = 44100, // 44.1Khz. Frecuencia calidad CD Audio
    .bits_per_sample = i2s_bits_per_sample_t(16), // Profundidad de bits de CD (16 bit)
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT, // Canal Mono usando Izquierda (L/R en GND)
    .communication_format = i2s_comm_format_t(I2S_COMM_FORMAT_I2S | I2S_COMM_FORMAT_I2S_MSB),
    .intr_alloc_flags = 0, // Flags por defecto
    .dma_buf_count = 8,
    .dma_buf_len = bufferLen,
    .use_apll = false
  };

  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
}

void i2s_setpin() {
  // Atamos nuestros pines definidos arriba al controlador hardware
  const i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = -1, // No hay altavoz! 
    .data_in_num = I2S_SD
  };

  i2s_set_pin(I2S_PORT, &pin_config);
}

void setup() {
  Serial.begin(115200);
  Serial.println("INMP441 I2S Test Iniciando... ABRE EL SERIAL PLOTTER PARA VER ONDAS");
  delay(1000);
  
  i2s_install();
  i2s_setpin();
  i2s_start(I2S_PORT);
}

void loop() {
  size_t bytesIn = 0;
  // Leemos datos crudos del I2S usando DMA 
  esp_err_t result = i2s_read(I2S_PORT, &sBuffer, bufferLen * sizeof(int16_t), &bytesIn, portMAX_DELAY);

  if (result == ESP_OK) {
    // Escupimos las muestras al serial para graficar 
    // Dividimos la cantidad de bytes leídos dando la capacidad a recorrer
    int samples_read = bytesIn / sizeof(int16_t);
    for (int i = 0; i < samples_read; i++) {
        // Graficador de plotter es feliz con salidas limpias separadas por saltos de línea
        Serial.println(sBuffer[i]);
    }
  }
}

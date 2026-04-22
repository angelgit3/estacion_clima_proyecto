#include <driver/i2s.h>

#define I2S_WS 25
#define I2S_SD 33
#define I2S_SCK 26
#define I2S_PORT I2S_NUM_0

#define bufferLen 64
int32_t sBuffer[bufferLen];

void i2s_install() {
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
}

void i2s_setpin() {
  const i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = -1,
    .data_in_num = I2S_SD
  };
  i2s_set_pin(I2S_PORT, &pin_config);
}

void setup() {
  Serial.begin(115200);
  i2s_install();
  i2s_setpin();
  i2s_start(I2S_PORT);
}

void loop() {
  size_t bytesIn = 0;
  esp_err_t result = i2s_read(I2S_PORT, &sBuffer, bufferLen * sizeof(int32_t), &bytesIn, portMAX_DELAY);

  if (result == ESP_OK) {
    int samples_read = bytesIn / sizeof(int32_t);
    for (int i = 0; i < samples_read; i++) {
      // Imprimimos el valor crudo de 32 bits
      // Si el micro funciona, acá deberías ver números de miles o millones al chiflar
      Serial.println(sBuffer[i]);
    }
  }
}

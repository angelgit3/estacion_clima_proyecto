/*
 * =====================================================================================
 * PROYECTO: ESTACIÓN METEOROLÓGICA (Pruebas Individuales)
 * SENSOR:   MPU6500 (Acelerómetro y Giroscopio de 6 Ejes - I2C)
 * =====================================================================================
 * 
 * ¿CÓMO CONECTARLO AL ESP32?
 * -------------------------------------------------------------------------------------
 * VCC   -> 3.3V (ESP32)
 * GND   -> GND
 * SDA   -> GPIO 21 (Comparte bus I2C con DS3231 y BME280)
 * SCL   -> GPIO 22 (Comparte bus I2C con DS3231 y BME280)
 * 
 * NOTA DE ARQUITECTURA:
 * El MPU6500 es el hermano mayor del famosísimo MPU6050 (solo cambia ligeramente
 * en registros y protocolo). Casi siempre funciona perfectamente con librerías del 6050
 * o puedes usar una específica como "MPU6500_WE". 
 * Por simplicidad extrema en esta prueba, usaremos la clásica `Adafruit MPU6050`, 
 * que sirve de maravilla. 
 * 
 * LIBRERÍAS NECESARIAS:
 * - "Adafruit MPU6050" de Adafruit
 * - "Adafruit Unified Sensor" de Adafruit
 * =====================================================================================
 */

#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

Adafruit_MPU6050 mpu;

void setup(void) {
  Serial.begin(115200);
  while (!Serial)
    delay(10); // Pausamos hasta que abra la terminal serial

  Serial.println("Iniciando prueba rápida del MPU6500...");

  // Inicializar bus I2C (en ESP32: SDA=21, SCL=22)
  Wire.begin(21, 22);

  // ¡Intentamos detectar el chip!
  if (!mpu.begin()) {
    Serial.println("Hubo un fallo. No encontré el MPU6500/6050. ¡Revisa la conexión I2C (SDA/SCL)!");
    while (1) {
      delay(10); // Bucle mortal
    }
  }
  Serial.println("¡MPU6500/6050 encontrado y listo!");

  // Rangos de configuración de sensibilidad
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  Serial.println("----------------------------------------------");
}

void loop() {
  /* ¡Magia! Traer los datos. Se usan variables de tipo "event" que encapsulan
     las medidas en metros/segundo cuadrado (aceleración) o rad/s (giroscopio) */
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // -- 1. Imprimir la Aceleración (X,Y,Z) --
  Serial.print("Acel [X: ");
  Serial.print(a.acceleration.x);
  Serial.print(" Y: ");
  Serial.print(a.acceleration.y);
  Serial.print(" Z: ");
  Serial.print(a.acceleration.z);
  Serial.print(" m/s^2] \t");

  // -- 2. Imprimir Giroscopio (X,Y,Z) --
  Serial.print("Giro [X: ");
  Serial.print(g.gyro.x);
  Serial.print(" Y: ");
  Serial.print(g.gyro.y);
  Serial.print(" Z: ");
  Serial.print(g.gyro.z);
  Serial.println(" rad/s]");

  // Retardo de una fracción de segundo
  delay(500); 
}

/*
 * =====================================================================================
 * PROYECTO: ESTACIÓN METEOROLÓGICA (Pruebas Individuales)
 * SENSOR:   BME280 (Sensor de Presión Barométrica, Temperatura y Humedad)
 * =====================================================================================
 * 
 * ¿CÓMO CONECTARLO AL ESP32? (Asumiendo módulo I2C de 4 pines)
 * -------------------------------------------------------------------------------------
 * VIN   -> 3.3V (ESP32) 
 * GND   -> GND
 * SDA   -> GPIO 21 (Comparte bus I2C)
 * SCL   -> GPIO 22 (Comparte bus I2C)
 * 
 * LIBRERÍAS NECESARIAS:
 * - "Adafruit BME280 Library" de Adafruit
 * - "Adafruit Unified Sensor" 
 * 
 * ERRORES COMUNES LEYENDO ESTO BIEN RÁPIDO:
 * 1. ¡Que el módulo sea un BMP280 (sin la E)! El BMP280 mide Presión/Temp pero NO humedad.
 *    Si tienes un BMP, tendrás que cambiar el #include por <Adafruit_BMP280.h> y 
 *    los objetos BME por BMP.
 * 2. La dirección I2C. Los genéricos suelen ser 0x76, los Adafruit 0x77.
 * =====================================================================================
 */

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

/* Objeto de tipo BME280 usando software I2C. 
   Por defecto buscará la dir I2C 0x77 o 0x76 */
Adafruit_BME280 bme; 

// SECCIÓN DE INICIALIZACIÓN
void setup() {
  Serial.begin(115200);
  while(!Serial);    // time to get serial running
  Serial.println(F("Iniciando BME280 test..."));

  Wire.begin(21, 22);
  
  unsigned status;
  // Intenta arrancar en la dirección esclava 0x76 (muy común en los chips BME chinos baratos!)
  status = bme.begin(0x76, &Wire);  
  
  if (!status) {
    // Si falla, probamos con 0x77 (A veces vienen por defecto en la otra dirección)
    status = bme.begin(0x77, &Wire);
    if (!status) {
        Serial.println("¡CRANE ERROR! No detecto un BME280 válido.");
        Serial.println("Checaté el cableado: VIN al 3.3v, GND al GND, SCL al 22, SDA al 21.");
        while (1) delay(10);
    }
  }

  Serial.println("-- Sensor Detectado Correctamente --");
  Serial.println();
}

void loop() { 
  // ¡Imprimimos Temperatura!
  Serial.print("Temperatura = ");
  Serial.print(bme.readTemperature());
  Serial.println(" °C");

  // La presión normal a nivel de mar es 1013.25 hPa
  Serial.print("Presión     = ");
  Serial.print(bme.readPressure() / 100.0F);
  Serial.println(" hPa");

  // Altitud estimada asumiendo los 1013.25hPa basales. 
  Serial.print("Ap. Altitud = ");
  Serial.print(bme.readAltitude(1013.25));
  Serial.println(" m");

  // !OJO! Si tienes un módulo BMP280 en vez de BME, leer la humedad te dará error.
  Serial.print("Humedad     = ");
  Serial.print(bme.readHumidity());
  Serial.println(" %");

  Serial.println();
  delay(2000); // Tómalo con calma (2 seg)
}

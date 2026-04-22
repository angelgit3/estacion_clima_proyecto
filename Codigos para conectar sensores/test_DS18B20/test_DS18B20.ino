/*
 * =====================================================================================
 * PROYECTO: ESTACIÓN METEOROLÓGICA (Pruebas Individuales)
 * SENSOR:   DS18B20 (Temperatura Digital)
 * =====================================================================================
 * 
 * ¿CÓMO CONECTARLO AL ESP32?
 * -------------------------------------------------------------------------------------
 * Cable ROJO    (VCC)   -> 3.3V (ESP32)
 * Cable NEGRO   (GND)   -> GND (ESP32)
 * Cable AMARILLO (Data) -> GPIO 4 (ESP32)
 * 
 * ¡MUY IMPORTANTE! (RESISTENCIA PULL-UP)
 * Debes colocar una resistencia de 4.7K Ohms conectando el cable de DATOS (Amarillo) 
 * con el cable VCC (Rojo). Sin esta resistencia, la comunicación 1-Wire no se forma y 
 * siempre leerás -127°C (que significa error de lectura).
 * 
 * LIBRERÍAS NECESARIAS (Instalar desde el Gestor de Librerías del Arduino IDE):
 * - "OneWire" by Paul Stoffregen
 * - "DallasTemperature" by Miles Burton
 * =====================================================================================
 */

#include <OneWire.h>
#include <DallasTemperature.h>

// Definimos el pin donde está conectado el cable de datos
#define ONE_WIRE_BUS 5

// Configuramos la instancia Onewire para comunicarse con cualquier dispositivo OneWire
OneWire oneWire(ONE_WIRE_BUS);

// Pasamos nuestra referencia OneWire a la librería DallasTemperature
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  Serial.println("Iniciando prueba del Sensor DS18B20...");
  
  // Iniciamos la librería
  sensors.begin();
  
  // Opcional: Contar cuántos sensores encontró en el cable
  int numSensores = sensors.getDeviceCount();
  Serial.print("Sensores encontrados en el bus: ");
  Serial.println(numSensores);
  
  if (numSensores == 0) {
    Serial.println("¡ATENCIÓN! No se encontró ningún sensor.");
    Serial.println("Verifica la resistencia de 4.7K entre Data y VCC, y los cables.");
  }
}

void loop() {
  // Solicitamos a los sensores que midan la temperatura
  sensors.requestTemperatures(); 
  
  // Obtenemos la temperatura del primer sensor (índice 0)
  float temperaturaC = sensors.getTempCByIndex(0);
  
  // Comprobamos si hubo un error de lectura (-127.00 es el código de error para Dallas)
  if(temperaturaC == DEVICE_DISCONNECTED_C) {
    Serial.println("Error: Sensor desconectado o error de lectura.");
  } else {
    Serial.print("Temperatura: ");
    Serial.print(temperaturaC);
    Serial.println(" °C");
  }
  
  delay(1000); // Esperamos 1 segundo antes de la próxima lectura
}

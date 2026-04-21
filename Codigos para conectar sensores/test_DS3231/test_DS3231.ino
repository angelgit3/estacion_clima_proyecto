/*
 * =====================================================================================
 * PROYECTO: ESTACIÓN METEOROLÓGICA (Pruebas Individuales)
 * SENSOR:   DS3231 (Módulo RTC Reloj de Tiempo Real I2C)
 * =====================================================================================
 * 
 * ¿CÓMO CONECTARLO AL ESP32?
 * -------------------------------------------------------------------------------------
 * VCC   -> 3.3V (O 5V si tu módulo lo pide, pero 3.3V suele ser más seguro en ESP32)
 * GND   -> GND
 * SDA   -> GPIO 21 (Pin oficial I2C en ESP32 DevKit)
 * SCL   -> GPIO 22 (Pin oficial I2C en ESP32 DevKit)
 * 
 * LIBRERÍAS NECESARIAS (Instalar desde el Gestor de Librerías):
 * - "RTClib" de Adafruit
 * =====================================================================================
 */

#include "RTClib.h"
#include <Wire.h> // Librería de base para control de arquitectura I2C

RTC_DS3231 rtc;

void setup() {
  Serial.begin(115200);

  // Inicializar bus I2C explícitamente en los pines elegidos (seguro mata confianza)
  Wire.begin(21, 22);

  if (!rtc.begin(&Wire)) {
    Serial.println("¡ERROR GRANDE! No pudimos encontrar al Reloj DS3231.");
    Serial.println("Verifica los cables SDA(21) y SCL(22). Revisa si las soldaduras están bien.");
    Serial.flush();
    while (1) delay(10); // Loop infinito de pare!
  }

  // Comprueba si el módulo acaba de arrancar o si perdió el poder de la pila
  if (rtc.lostPower()) {
    Serial.println("¡Detectamos que el RTC se quedó sin pila o es la primera vez que inicia!");
    // Siguiendo el comentario de abajo ajustará la hora basándose en el momento en el 
    // que este código (sketch) fue COMPILADO. Es un tremendo truco:
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    // Si quisieras setear manualmente: 
    // rtc.adjust(DateTime(2023, 10, 15, 12, 30, 0)); // Año, Mes, Dia, Hora, Minuto, Segundo
  }

  Serial.println("Prueba de Módulo RTC DS3231 Inicializada con Éxito.");
}

void loop() {
  // Le pedimos al módulo RTC que nos devuelva la fecha/hora como la tenga registrada
  DateTime now = rtc.now();

  Serial.print("Fecha y Hora Actual de Estación: ");
  Serial.print(now.year(), DEC);
  Serial.print('/');
  Serial.print(now.month(), DEC);
  Serial.print('/');
  Serial.print(now.day(), DEC);
  Serial.print(" ");
  Serial.print(now.hour(), DEC);
  Serial.print(':');
  Serial.print(now.minute(), DEC);
  Serial.print(':');
  Serial.print(now.second(), DEC);
  
  // El DS3231 también tiene un termómetro interno muy básico para compensar la frecuencia del cristal!
  // Lo imprimimos para chusmear
  Serial.print("  | Temp Interior RTC: ");
  Serial.print(rtc.getTemperature());
  Serial.println(" °C");

  delay(3000); // Demora 3 segundos
}

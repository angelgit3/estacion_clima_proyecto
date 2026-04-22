/*
 * =====================================================================================
 * PROYECTO: ESTACIÓN METEOROLÓGICA (Pruebas Individuales)
 * SENSOR:   Módulo LDR LM393 (Fotorresistencia para intensidad de luz)
 * =====================================================================================
 * 
 * ¿CÓMO CONECTARLO AL ESP32?
 * -------------------------------------------------------------------------------------
 * VCC   -> 3.3V (ESP32)
 * GND   -> GND (ESP32)
 * AO (Analog Out)  -> GPIO 34 (ESP32)
 * DO (Digital Out) -> [NO LO USAREMOS AHORA. El DO lanza 1 o 0 ajustando el potenciómetro módulo, pero con AO sabremos la exacta oscuridad/Claridad.]
 * 
 * EXPLICACIÓN Y LÓGICA:
 * Vamos a leer la "cantidad" cruda de un pin analógico del ESP32. 
 * El ADC del ESP32 es de 12 bits, lo que significa que el valor analógico que leeremos
 * irá desde 0 (0 Voltios) hasta 4095 (3.3 Voltios). 
 * Dependiendo del LM393, 0 puede ser muchísima luz, y 4095 total oscuridad (o viceversa).
 * =====================================================================================
 */

#define PIN_LDR_AO 34

void setup() {
  Serial.begin(115200);
  
  // En las entradas analógicas en ESP32 no es estrictamente necesario el pinMode para leer analógico, 
  // pero es buena práctica declararlo.
  // IMPORTANTE: los GPIOS >= 34 solo sirven como input en el ESP32, ¡son perfectos para esto!
  pinMode(PIN_LDR_AO, INPUT);
  
  Serial.println("Prueba de LDR + LM393 Inicializada...");
}

void loop() {
  // Leemos el valor del conversor Análogo a Digital
  int valorCrudoLuz = analogRead(PIN_LDR_AO);
  
  // Transformamos ese valor bizarro de 0-4095 a un porcentaje más digerible para la cabeza (0-100%)
  // OJO: Si en tu sensor es al revés (0 es oscuro y 4095 es claro), invierte el cálculo así:
  // int porcentajeLuz = map(valorCrudoLuz, 0, 4095, 0, 100);
  int porcentajeOscuridad = map(valorCrudoLuz, 0, 4095, 0, 100);
  
  Serial.print("Sensor Luz Crudo (0-4095): ");
  Serial.print(valorCrudoLuz);
  Serial.print("  --> Equivalente Oscuridad: ");
  Serial.print(porcentajeOscuridad);
  Serial.println(" %");

  delay(500); // Demora medio segundo para no saturar la pantalla
}

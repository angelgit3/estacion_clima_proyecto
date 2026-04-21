/*
 * =====================================================================================
 * PROYECTO: ESTACIÓN METEOROLÓGICA (Pruebas Individuales)
 * SENSOR:   Módulo KY-003 (Sensor Magnético de Efecto Hall para Anemómetro)
 * =====================================================================================
 * 
 * ¿CÓMO CONECTARLO AL ESP32?
 * -------------------------------------------------------------------------------------
 * Pin '-' o 'GND' -> GND (ESP32)
 * Pin del medio   -> 3.3V (ESP32) 
 * Pin 'S' o 'Do'  -> GPIO 27 (ESP32)
 * 
 * EXPLICACIÓN Y LÓGICA:
 * El sensor cambiará su estado digital (de HIGH a LOW) cuando detecte un campo magnético
 * (un imán) acercándose. Al ponerse en una veleta o anemómetro, cada vez que el imán
 * pase frente al sensor, registrará 1 "pulso". Usamos Interrupciones por Hardware ()
 * en lugar de leerlo constantemente dentro del loop(), lo que hace que jamás perdamos 
 * un solo pulso por más rápido que gire el anemómetro.
 * 
 * NOTA: Para el ESP32, es súper sano activar el Pull-Up interno (INPUT_PULLUP) 
 * por si el módulo no trae buena resistencia de pull-up propia.
 * =====================================================================================
 */

#define PIN_ANEMOMETRO 27

// Variables para contar pulsos. 'volatile' es clave cuando se usan interrupciones
volatile unsigned long conteoPasos = 0;
unsigned long ultimoConteo = 0;

// Esta fusión rápida (ISR) se ejecuta CADA VEZ que el imán pasa.
// IRAM_ATTR se manda a la memoria súper rápida del ESP para que no se pierda detalle
void IRAM_ATTR contarPulso() {
  conteoPasos++;
}

void setup() {
  Serial.begin(115200);
  
  // Condiguramos pin como entrada asegurando que su estado base sea ALTO (HIGH)
  pinMode(PIN_ANEMOMETRO, INPUT_PULLUP);
  
  // Enganchamos nuestra interrupción. 'FALLING' significa que se activará
  // justo cuando el imán se acerque y tire el voltaje de HIGH a LOW.
  attachInterrupt(digitalPinToInterrupt(PIN_ANEMOMETRO), contarPulso, FALLING);
  
  Serial.println("Prueba KY-003 (Anemómetro) Inicializada...");
  Serial.println("Acerca un imán para ver cómo sube el contador de pulsos.");
}

void loop() {
  // Solo imprimimos si el conteo actual es mayor que el del ciclo anterior
  if (conteoPasos != ultimoConteo) {
    // Apagamos momentaneamente las interrupciones para copiar la variable (buena práctica)
    noInterrupts();
    unsigned long pasosSeguros = conteoPasos;
    interrupts();
    
    ultimoConteo = pasosSeguros;
    
    Serial.print("¡Imán detectado! Pulsos totales: ");
    Serial.println(pasosSeguros);
  }
  
  // Puedes dejar un retardo pequeño, no importa, la interrupción funciona en segundo plano!
  delay(10); 
}

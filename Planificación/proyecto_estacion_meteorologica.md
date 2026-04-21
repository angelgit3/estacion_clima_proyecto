# Planificación Arquitectónica: Estación Meteorológica ESP32

## 1. Visión General del Proyecto
El objetivo del proyecto es construir una **Estación Meteorológica Integral** (y de monitoreo ambiental) utilizando un microcontrolador ESP32 como cerebro principal. El sistema se encarga de recolectar datos de 7 sensores distintos para medir variables climatológicas y ambientales.

La arquitectura del software sigue el principio de **"Desarrollo Modular"**: primero se aíslan y validan las partes (pruebas unitarias por hardware) antes de realizar la integración total en un código maestro.

---

## 2. Mapa de Hardware y Arquitectura de Pines
El sistema está diseñado de forma inteligente para compartir buses de comunicación y evitar conflictos de pines, maximizando la eficiencia del ESP32.

### 🔌 Bus I2C Compartido (Pines: `SDA = 21`, `SCL = 22`)
Al ser un bus de comunicación direccional, estos tres componentes pueden compartir los mismos dos cables físicos:
*   **BME280:** Mide temperatura ambiental, humedad y presión barométrica (y altitud aproximada).
*   **MPU6500:** Acelerómetro y giroscopio. Útil para medir vibraciones mecánicas de la estación o la inclinación/estabilidad del mástil.
*   **DS3231 (RTC):** Módulo de Reloj de Tiempo Real. Mantiene la fecha y hora exactas de cada medición, incluso si el ESP32 se reinicia o pierde internet.

### 🎙️ Bus I2S Dedicado (Audio de Alta Velocidad)
*   **INMP441 (Micrófono MEMS):** Pines `WS = 25`, `SCK = 26`, `SD = 33`.
    *   *Propósito:* Mide los niveles de ruido ambiental en decibeles. Se utiliza DMA (Direct Memory Access) para no bloquear el procesador mientras escucha el entorno.

### 📡 Pines Digitales y Analógicos Independientes
*   **DS18B20 (Temperatura Precisa):** Pin `4` (Protocolo One-Wire). Ideal para medir una temperatura exterior específica o de suelo, con alta precisión y resistencia a la intemperie. Requiere resistencia Pull-Up de 4.7k.
*   **LDR LM393 (Fotorresistencia):** Pin `34` (ADC1).
    *   *Propósito:* Mide el porcentaje de luz solar/oscuridad. El pin 34 es clave porque pertenece al ADC1, el cual *no* se desactiva cuando el ESP32 enciende el Wi-Fi.
*   **KY-003 (Sensor Magnético Efecto Hall):** Pin `27` (Interrupción Digital `INPUT_PULLUP`).
    *   *Propósito:* Funciona como contador de vueltas para un **Anemómetro** (para medir la velocidad del viento). Funciona mediante interrupciones de hardware (`FALLING`) para no perder ningún pulso por más rápido que gire.

---

## 3. Fases de Desarrollo

### 🟢 FASE 1: Pruebas Unitarias (ESTADO ACTUAL: COMPLETADO)
*   **Objetivo:** Desarrollar 7 códigos (`.ino`) independientes.
*   **Verificación:** 
    *   [x] Pines sin colisiones.
    *   [x] Pines libres de problemas de "Strapping" durante el booteo (Corregido Pin del KY-003).
    *   [x] Documentación clara en cada código de prueba.
*   **Acción del Usuario:** Compilar y probar físicamente cada sensor con su respectivo código para descartar hardware defectuoso.

### 🟡 FASE 2: Integración (PRÓXIMO PASO)
*   **Objetivo:** Crear el archivo `main.ino` dentro de la carpeta `Aplicación`.
*   **Mecánica:** Unir las lógicas de inicialización (`setup`) y lectura (`loop`) de los 7 sensores usando técnicas no bloqueantes (reemplazar los `delay()` por `millis()`).
*   **Resultado esperado:** Un solo código que escupa por el Monitor Serie un JSON o una cadena formateada con todos los valores simultáneos (Ej: `Temp: 24°C | Hum: 50% | Luz: 80% | Viento: 15km/h | Ruido: 40dB`).

### ⚪ FASE 3: Conectividad y Almacenamiento (FUTURO)
*   **Objetivo:** Darle uso a los datos recolectados aprovechando el ESP32.
*   **Posibles implementaciones:**
    *   Conectar a Wi-Fi y enviar datos a un servidor/Dashboard (Ej. ThingsBoard, Firebase, MQTT, ThingSpeak).
    *   Guardar un log de los datos en una tarjeta SD (opcional).

---

## 4. Notas Arquitectónicas y Observaciones a Revisar
1.  **Doble Sensor de Temperatura:** Tenemos temperatura en el BME280 y en el DS18B20. *Pregunta para el diseño final:* ¿El BME280 irá encapsulado en una garita meteorológica midiendo humedad/presión general, mientras que el DS18B20 (que suele venir en una sonda impermeable) medirá agua/suelo o temperatura directa al sol?
2.  **Micrófono INMP441:** Escuchar audio constantemente y convertirlo a un valor RMS o nivel de decibeles consume ciclos de procesamiento. Habrá que calibrarlo bien en la Fase 2 para que no ralentice las lecturas de los demás sensores.
3.  **Anemómetro:** El conteo de pulsos ya funciona, pero falta la matemática final para convertir "X pulsos por segundo" a "Kilómetros por hora" según el radio de rotación físico del anemómetro impreso en 3D/comprado.

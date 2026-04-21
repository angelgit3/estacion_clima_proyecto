# Planificación Arquitectónica: Estación Meteorológica ESP32 + Supabase + Vite

## 1. Visión General del Proyecto
El objetivo del proyecto es construir una **Estación Meteorológica Integral IoT** utilizando un microcontrolador ESP32 como hardware central, una base de datos en la nube (Supabase) y un Dashboard web moderno (Vite + React) para visualizar los datos en tiempo real y el histórico.

> 🤖 **Aviso para Agentes de IA:** Este documento es la "Fuente de la Verdad" de la arquitectura. La estrategia de delegación del usuario implica que ustedes lean este plan y se ciñan estrictamente a estos lineamientos para ejecutar su fase correspondiente.

---

## 2. Mapa de Hardware y Arquitectura de Pines (ESP32)
El sistema recolecta datos de 7 sensores. Los pines fueron elegidos estratégicamente para evitar colisiones entre el Wi-Fi y el ADC, y evitar problemas en los pines de booteo (Strapping pins).

*   **Bus I2C Compartido (`SDA = 21`, `SCL = 22`):**
    *   BME280 (Temperatura, Humedad, Presión).
    *   MPU6500 (Acelerómetro/Giroscopio).
    *   DS3231 (Módulo RTC para fecha/hora local).
*   **Bus I2S Dedicado:**
    *   INMP441 - Micrófono (`WS = 25`, `SCK = 26`, `SD = 33`).
*   **Pines Analógicos/Digitales Independientes:**
    *   DS18B20 (Temperatura exterior): `Pin 4` (OneWire con resistencia Pull-Up de 4.7k).
    *   LDR LM393 (Sensor de luz): `Pin 34` (ADC1, funciona en paralelo con el Wi-Fi).
    *   KY-003 (Anemómetro/Efecto Hall): `Pin 27` (Interrupción digital `FALLING`, `INPUT_PULLUP`).

---

## 3. Hoja de Ruta de Desarrollo (Por Fases y Agentes)

El desarrollo se divide en 4 fases. Cada agente de IA asignado a una fase debe completar su código asumiendo el contexto de las fases previas y posteriores.

### 🟡 FASE 1: Firmware del ESP32 (Integración `main.ino`)
*   **Contexto:** Los códigos individuales de los 7 sensores ya fueron validados aisladamente en la carpeta `Codigos para conectar sensores`.
*   **Tarea del Agente IA:** 
    1. Unificar las lecturas de los 7 sensores en un solo código maestro.
    2. Aplicar una arquitectura basada en `millis()` (Prohibido usar `delay()` en el loop principal) para garantizar que el micrófono y el anemómetro no pierdan lecturas.
    3. Conectar el ESP32 a la red Wi-Fi local mediante `WiFi.h`.
    4. Empaquetar las lecturas en un JSON y enviarlas mediante `HTTP POST` directo a la API REST de Supabase cada determinado tiempo (ej. 5 minutos).

### 🔵 FASE 2: Backend y Estructura de Datos (Supabase + Script Sembrador)
*   **Contexto:** Se usará Supabase (PostgreSQL) como Backend IoT. Por falta de tiempo de recolección física, se necesita falsear el historial inicial.
*   **Tarea del Agente IA:**
    1. Proveer el script SQL exacto para que el usuario cree la tabla `mediciones` en Supabase de forma manual.
    2. Programar un "Script Sembrador" local (`seed.js` o `seed.py`). Este script debe generar e inyectar en Supabase **5 días de datos sintéticos (falsos)**, asegurándose de que las curvas matemáticas sean biológicamente y climatológicamente realistas (ej. temperatura baja en la noche, picos de luz al mediodía, variaciones de humedad).

### 🔴 FASE 3: Frontend y Dashboard Visual (Vite + React)
*   **Contexto:** Creación del panel de control web en la carpeta `Aplicación`.
*   **Tarea del Agente IA:**
    1. Escaffoldear un proyecto Vite con React (o Vanilla JS según indique el usuario).
    2. Instalar y configurar el cliente oficial `@supabase/supabase-js`.
    3. Construir una interfaz visual tipo "Dashboard" (idealmente Dark Mode) usando librerías como `Recharts` o `Chart.js`.
    4. El Dashboard debe consultar los datos históricos inyectados en la Fase 2 y suscribirse en tiempo real a las nuevas lecturas emitidas por el ESP32 en la Fase 1.

### 🟢 FASE 4: Pulido y Despliegue (Vercel)
*   **Contexto:** Recta final para la presentación.
*   **Tarea del Agente IA:**
    1. Pulir errores de UI/UX en el dashboard.
    2. Limpiar código sobrante de Arduino.
    3. Preparar el repositorio y dar comandos/instrucciones para desplegar la carpeta `Aplicación` en **Vercel** de forma gratuita.

---

## 4. Justificación de Diseño de Hardware (Alimentación)
La estación está diseñada como un **Nodo de Monitoreo Activo (Active Edge-Computing Node)** y no como una estación pasiva de bajo consumo.
*   **Fuente de Energía:** Conexión continua a red eléctrica (Fuente 5V).
*   **Justificación Técnica:** Los requerimientos de detección de contaminación acústica (micrófono INMP441) y ráfagas dinámicas de viento (Anemómetro por interrupciones) exigen procesamiento activo el 100% del tiempo. El uso de baterías obligaría al microcontrolador a entrar en *Deep Sleep* periódicamente, perdiendo el muestreo crítico de los picos de ruido y las ráfagas súbitas. La alimentación continua permite el uso de DMA e interrupciones en tiempo real.

---

## 5. Metodología de Ensamblaje y Validación Rápida
Al trabajar junto al Agente de IA de la Fase 1, se recomienda armar el circuito de forma **incremental** para aislar errores:

1.  [ ] **Bus I2C (BME280, MPU6500, DS3231):** Conectar solo estos tres a los pines `21 y 22`. Correr un I2C Scanner y confirmar que las 3 direcciones hexadecimales sean detectadas.
2.  [ ] **Micrófono (INMP441):** Sumar pines `25, 26, 33`. Confirmar que el código maestro no se bloquee mientras escucha (el DMA debe correr en segundo plano).
3.  [ ] **Anemómetro (KY-003):** Conectar al `27`. Girar el imán a mano y asegurar que las interrupciones se disparen sin reinicios de la placa (Watchdog timeouts).
4.  [ ] **Sensores Simples (DS18B20 y LDR):** Conectar pines `4` (con Pull-up) y `34`.
5.  [ ] **Test Wi-Fi Final:** Validar en el Monitor Serie que el JSON se imprime correctamente *antes* de activar la conexión a internet y el envío POST.

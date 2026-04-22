# Planificación Arquitectónica: Estación Meteorológica ESP32 + Supabase + Vite

## 1. Visión General del Proyecto
El objetivo del proyecto es construir una **Estación Meteorológica Integral IoT** utilizando un microcontrolador ESP32 como hardware central, una base de datos en la nube (Supabase) y un Dashboard web moderno (Vite + React) para visualizar los datos en tiempo real y el histórico.

> 🤖 **Aviso para Agentes de IA:** Este documento es la "Fuente de la Verdad" de la arquitectura. La estrategia de delegación del usuario implica que ustedes lean este plan y se ciñan estrictamente a estos lineamientos para ejecutar su fase correspondiente.

---

## 2. Mapa de Hardware y Arquitectura de Pines (ESP32)
El sistema recolecta datos de 7 sensores. Los pines fueron elegidos estratégicamente para evitar colisiones entre el Wi-Fi y el ADC, y evitar problemas en los pines de booteo (Strapping pins).

*   **Bus I2C Compartido (`SDA = 21`, `SCL = 22`):**
    *   BME280 (Temperatura, Humedad, Presión).
    *   MPU6500 (Acelerómetro/Giroscopio) — pin `AD0` a 3.3V para forzar dirección `0x69` y evitar colisión con `0x68`.
*   **Sincronización de Tiempo: NTP (Software, sin hardware extra):**
    *   Se usa `configTime()` del core de ESP32 para sincronizar el reloj interno con `pool.ntp.org` al arrancar.
    *   **Justificación:** La estación siempre está en línea. NTP es más preciso que el DS3231 y elimina un componente físico y el conflicto de dirección I2C `0x68` con el MPU6500.
*   **Bus I2S Dedicado:**
    *   INMP441 - Micrófono (`WS = 25`, `SCK = 26`, `SD = 33`).
*   **Pines Analógicos/Digitales Independientes:**
    *   ~~DS18B20 (Temperatura exterior)~~ — **Eliminado.** La temperatura la provee el BME280. El módulo presentó problemas de detección consistentes (posible pull-up faltante en el módulo).
    *   ~~LDR LM393 (Sensor de luz)~~ — **Eliminado.** El módulo disponible solo ofrece salida digital (DO), sin valor analógico real para la estación.
    *   KY-003 (Anemómetro/Efecto Hall): `Pin 27` (Interrupción digital `FALLING`, `INPUT_PULLUP`).

---

## 3. Hoja de Ruta de Desarrollo (Por Fases y Agentes)

El desarrollo se divide en 4 fases. Cada agente de IA asignado a una fase debe completar su código asumiendo el contexto de las fases previas y posteriores.

### 🟡 FASE 1: Firmware del ESP32 (Integración `main.ino`) - ✅ TERMINADA
*   **Contexto:** Los códigos individuales de los **4 sensores activos** ya fueron validados. 
*   **Logros:** 
    1. Unificadas las lecturas de: **BME280**, **MPU6500**, **INMP441** y **KY-003**.
    2. Arquitectura basada en `millis()` implementada con éxito. Lectura de micrófono por DMA continuo e interrupciones en segundo plano.
    3. Conexión Wi-Fi local configurada y hora sincronizada vía NTP (ISO8601).
    4. Envío exitoso mediante HTTP POST a la REST API de Supabase cada 60 segundos (Código 201 validado).

### 🔵 FASE 2: Backend y Estructura de Datos (Supabase) - ✅ TERMINADA
*   **Contexto:** Se generó la tabla principal `mediciones` con soporte para todos los sensores.
*   **Logros:**
    1. Se insertó un script sembrador (`seed_historico.mjs`) usando Open-Meteo para generar 5 días de historial climático y simular una "integración tardía" de los sensores de ruido y viento. Base de datos con +120 registros iniciales.

### 🟢 FASE 3: Interfaz Web (Vite + React) - ⏳ EN PROGRESO
*   **Contexto:** El Frontend no realizará cálculos pesados de hardware, salvo la conversión de medidas crudas a métricas de usuario.
*   **Calibración del Anemómetro (Para el Frontend):**
    *   Radio de giro (centro a la cuchara): **12.5 cm (0.125m)**.
    *   Imanes por vuelta: **1**.
    *   Fórmula a implementar: `Velocidad(km/h) = (Pulsos_minuto * (2 * Pi * 0.125) * 60) / 1000`.
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

1.  [x] **Bus I2C (BME280 + MPU6500):** ✅ Detectados en `0x69` y `0x76`. Pin `AD0` del MPU6500 en 3.3V. Validado.
2.  [x] **Micrófono (INMP441):** ✅ Validado. Valores de decenas de miles al hablar. DMA corriendo en segundo plano.
3.  [x] **Anemómetro (KY-003):** ✅ Validado. Interrupciones contando pulsos correctamente con imán.
4.  [x] **LDR:** ❌ Eliminado. Módulo solo tiene DO (digital), sin valor analógico útil. ~~DS18B20 eliminado.~~
5.  [ ] **Test Wi-Fi + NTP:** Conectar a la red y validar en el Monitor Serie que la hora se sincroniza y el JSON se imprime correctamente *antes* de activar el envío POST a Supabase.

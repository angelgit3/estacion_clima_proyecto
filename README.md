# 🌤️ AeroSense IoT (Estación de Meteoros)

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)
![ESP32](https://img.shields.io/badge/Hardware-ESP32%20(C%2B%2B)-E7352C?logo=espressif&logoColor=white)

Un sistema de telemetría meteorológica de extremo a extremo, diseñado para la captura, transmisión y visualización en tiempo real de condiciones atmosféricas y ambientales.

## 🎯 Arquitectura del Sistema

El proyecto consta de tres capas principales que operan de manera asíncrona pero perfectamente sincronizada a través de WebSockets (Realtime) y bases de datos relacionales:

```mermaid
graph TD;
    subgraph Capa Hardware (IoT)
    ESP32[ESP32 Microcontroller]
    BME280[BME280: Temp, Hum, Pres] --> ESP32
    KY003[KY-003: Anemómetro] --> ESP32
    INMP441[INMP441: Micrófono I2S] --> ESP32
    end

    subgraph Capa Servidor (Backend)
    Supabase[(Supabase PostgreSQL)]
    ESP32 -- "HTTP POST (JSON) via Wi-Fi" --> Supabase
    end

    subgraph Capa Cliente (Frontend)
    React[React / Vite Dashboard]
    Supabase -- "Suscripción Realtime (WebSockets)" --> React
    Supabase -- "REST API (Histórico)" --> React
    end
```

## 🚀 Características Principales

- **Telemetría en Vivo:** Transmisión de datos cada minuto con sincronización NTP (Network Time Protocol) bajo estándar UTC (ISO 8601).
- **Dashboard Reactivo:** Interfaz gráfica construida con Tailwind CSS y Recharts, implementando "Glassmorphism" para una estética premium.
- **Eficiencia en el DOM:** El sistema de gráficas históricas cuenta con algoritmos de downsampling dinámico (máximo 150 puntos renderizados) para garantizar rendimiento fluido sin importar la escala de tiempo elegida (1H a 30D).
- **Escalabilidad de Consultas:** Evade los límites de paginación de bases de datos mediante consultas en orden descendente con inversión de memoria local en el cliente.

## 📂 Estructura del Proyecto

*Nota: La estructura ideal planificada es la siguiente:*

- `/dashboard`: Frontend en React (Vite). Arquitectura orientada a componentes.
- `/firmware`: Código C++ para la programación del microcontrolador ESP32.
  - `/firmware/tests`: Scripts de validación individual por cada módulo de hardware I2C/I2S.
- `/database`: Scripts de Node.js para población de base de datos (Seeding) y esquema de Supabase.
- `/docs`: Documentación técnica, bitácoras de diseño y planificaciones arquitectónicas del proyecto.

## 🛠️ Instalación y Uso

### 1. Levantar el Dashboard (Local)
1. Navegar al directorio del frontend: `cd dashboard` (o `Aplicación`).
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno creando un `.env`:
   ```env
   VITE_SUPABASE_URL=tu_url_aqui
   VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
   ```
4. Correr el entorno de desarrollo: `npm run dev`

### 2. Despliegue del Firmware
1. Abrir `main_estacion.ino` en el Arduino IDE o VSCode con PlatformIO.
2. Actualizar las credenciales de Wi-Fi (`ssid` y `password`).
3. Actualizar la `SUPABASE_URL` y la `SUPABASE_KEY` en el código C++.
4. Compilar y flashear a la placa ESP32. El monitor serial (a 115200 baudios) confirmará las peticiones HTTP `201`.

## 👨‍💻 Autor
Desarrollado como proyecto académico de ingeniería para demostrar el dominio de arquitecturas Full-Stack e integración Hardware-Software (IoT).

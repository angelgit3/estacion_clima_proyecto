# 🛰️ SkyVision Pro (Sonda Meteorológica IoT)

![Status](https://img.shields.io/badge/Status-Version%202.0-blueviolet)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)

**SkyVision Pro** es un ecosistema de monitoreo ambiental avanzado diseñado para ofrecer precisión métrica y una experiencia de usuario excepcional. Integra hardware de bajo consumo con una plataforma de datos en la nube de alta disponibilidad.

---

## 🎨 Experiencia Visual
El dashboard implementa el sistema de diseño **Celestial Breeze**, enfocado en la claridad, el minimalismo y el uso de *Frosted Glass* (Glassmorphism) para ofrecer una estética de grado profesional.

## 🏗️ Arquitectura de Datos
El sistema utiliza una arquitectura reactiva donde el flujo de información es bidireccional y en tiempo real:

```mermaid
graph LR;
    subgraph IoT ["Nodos de Captura"]
    ESP32[ESP32 Core]
    SENSORS[BME280 + KY-003 + INMP441] --> ESP32
    end

    subgraph Cloud ["Infraestructura"]
    DB[(Supabase / PostgreSQL)]
    ESP32 -- "JSON Payload" --> DB
    end

    subgraph Client ["Visualización"]
    App[SkyVision Dashboard]
    DB -- "Realtime Stream" --> App
    end
```

## ⚡ Características Destacadas
- **Backfill Inteligente:** Capacidad de recuperar datos históricos mediante integración con APIs climáticas globales para cubrir vacíos de telemetría.
- **Analíticas Dinámicas:** Visualización multiescala (1H, 24H, 7D, 30D) con optimización de renderizado de puntos críticos.
- **Pila Tecnológica Moderna:** React 18, Vite, Lucide/Material Symbols y Framer Motion.

## 📂 Organización del Proyecto
- `Aplicación/`: Frontend en React. Implementa Atomic Design para componentes de dashboard.
- `Firmware/`: Código fuente del microcontrolador (Arduino/C++).
- `docs/`: Esquemas de base de datos y documentación de sensores.
- `Reporte_Latex/`: Documentación académica profesional del proyecto.

## 🚀 Inicio Rápido

### Frontend
```bash
cd Aplicación
npm install
# Configura tu .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

### Hardware
1. Cargar `Firmware/main_estacion/main_estacion.ino` en la placa ESP32.
2. Configurar credenciales en la sección de constantes del firmware.
3. El puerto Serial debe estar configurado a `115200` baudios.

---
**Desarrollado con pasión por la ingeniería y el diseño.**


import nidaqmx
import numpy as np
import time
import requests
import json
from datetime import datetime, timezone

# --- CONFIGURACIÓN DE SUPABASE ---
SUPABASE_URL = "https://koxiobqhwvfkomiqxbor.supabase.co"
# OJO: Pegá aquí la clave anon que tenés en tu .env del dashboard
SUPABASE_KEY = "TU_SUPABASE_ANON_KEY" 

# --- CONFIGURACIÓN DEL NI myDAQ ---
# Asegurate de que el dispositivo se llame "myDAQ1" en NI MAX, y que el mic esté en ai0
DAQ_CHANNEL = "myDAQ1/ai0"
SAMPLE_RATE = 10000  # Muestras por segundo
SAMPLES_PER_READ = 2000 # Leer 0.2 segundos de audio para analizar

# Configuración del envío (Petición del usuario: cada 5 segundos para pruebas)
UPDATE_INTERVAL_SECONDS = 5

def calculate_db(voltage_array):
    """Convierte el arreglo de voltajes a un pseudo-nivel de decibeles."""
    # 1. Eliminar el offset de DC (el micrófono suele tener un voltaje base constante)
    voltage_array = voltage_array - np.mean(voltage_array)
    
    # 2. Calcular el valor RMS (Root Mean Square)
    rms_voltage = np.sqrt(np.mean(voltage_array**2))
    
    # 3. Convertir a dB (Reference = 0.00002 V, típico en acústica, ajustable)
    # Evitar log10 de cero
    if rms_voltage <= 0:
        return 0.0
        
    db = 20 * np.log10(rms_voltage / 0.00002)
    # Limitamos para que no tire valores locos negativos en silencio absoluto
    return max(0.0, round(db, 2))

def send_to_supabase(db_level):
    """Envía el valor de ruido a la tabla 'mediciones'."""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    # Payload con la nueva columna 'ruido_mydaq'
    # No mandamos temp/humedad para no interferir con el ESP32, la BD los pondrá como NULL
    payload = {
        "ruido_mydaq": db_level,
        "fecha_rtc": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/mediciones",
            headers=headers,
            data=json.dumps(payload)
        )
        if response.status_code == 201:
            print(f"✅ Enviado: {db_level} dB")
        else:
            print(f"❌ Error Supabase ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"⚠️ Error de red: {e}")

def main():
    print("🎙️ Iniciando Lector de Ruido myDAQ...")
    print(f"Canal: {DAQ_CHANNEL} | Intervalo: {UPDATE_INTERVAL_SECONDS}s")
    
    if SUPABASE_KEY == "TU_SUPABASE_ANON_KEY":
        print("⚠️ ALERTA: No has pegado tu SUPABASE_KEY en el script. Fallarán los envíos.")
        
    try:
        # Iniciamos la tarea de DAQ
        with nidaqmx.Task() as task:
            task.ai_channels.add_ai_voltage_chan(DAQ_CHANNEL)
            # Configuramos el timing continuo
            task.timing.cfg_samp_clk_timing(rate=SAMPLE_RATE)
            
            while True:
                # Leer muestras
                data = task.read(number_of_samples_per_channel=SAMPLES_PER_READ)
                np_data = np.array(data)
                
                # Procesar dB
                db_level = calculate_db(np_data)
                
                # Enviar a Supabase
                send_to_supabase(db_level)
                
                # Esperar hasta el próximo envío
                time.sleep(UPDATE_INTERVAL_SECONDS)
                
    except nidaqmx.errors.DaqError as e:
        print(f"\n❌ Error de NI-DAQmx (¿Está conectado el myDAQ?):\n{e}")
    except KeyboardInterrupt:
        print("\n🛑 Lector detenido por el usuario.")

if __name__ == "__main__":
    main()

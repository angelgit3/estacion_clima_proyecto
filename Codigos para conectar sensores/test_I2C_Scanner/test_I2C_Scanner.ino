#include <Wire.h>

void setup() {
  Serial.begin(115200);
  while (!Serial); // Esperamos al monitor serial
  Serial.println("\nI2C Scanner");
  // Inicializamos en los pines oficiales del proyecto
  Wire.begin(21, 22);
}

void loop() {
  byte error, address;
  int nDevices;

  Serial.println("Escaneando bus I2C...");

  nDevices = 0;
  for(address = 1; address < 127; address++ ) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0) {
      Serial.print("Dispositivo I2C encontrado en dirección 0x");
      if (address < 16)
        Serial.print("0");
      Serial.print(address, HEX);
      Serial.println(" !");
      nDevices++;
    }
    else if (error == 4) {
      Serial.print("Error desconocido en dirección 0x");
      if (address < 16)
        Serial.print("0");
      Serial.println(address, HEX);
    }    
  }
  
  if (nDevices == 0)
    Serial.println("No se encontraron dispositivos I2C\n");
  else
    Serial.println("Escaneo completado\n");

  delay(5000); // Espera 5 segundos para el siguiente escaneo
}

# Heru IoT Firmware

This directory contains the firmware for the ESP32 microcontroller used in the Heru cold chain monitoring system.

## Hardware Requirements
- **ESP32 Development Board** (e.g., ESP32 DevKit V1)
- **DHT22 Sensor** (Temperature & Humidity)
- Jumper wires & Breadboard

## Wiring
| DHT22 Pin | ESP32 Pin |
|-----------|-----------|
| VCC       | 3.3V      |
| DATA      | GPIO 4    |
| GND       | GND       |

*Note: Some DHT22 modules require a pull-up resistor (4.7kΩ - 10kΩ) between VCC and DATA if not built-in.*

## Configuration
1.  Open `src/config.h`.
2.  Update `WIFI_SSID` and `WIFI_PASSWORD` with your network credentials.
3.  Update `MQTT_SERVER` with the IP address of the machine running the Heru IoT Server.
4.  Ensure `MQTT_PORT` matches your server (default 1883).

## Flashing
1.  Install [PlatformIO](https://platformio.org/) (VSCode Extension recommended).
2.  Open this directory in PlatformIO.
3.  Connect your ESP32 via USB.
4.  Click **Upload** (Right arrow icon in the bottom toolbar).
5.  Open the **Serial Monitor** (Plug icon) to see logs.

## Testing
Once flashed, the device will:
1.  Connect to WiFi.
2.  Connect to the MQTT Broker.
3.  Read temperature/humidity every 30 seconds.
4.  Publish JSON data to `heru/sensors/esp32_sensor_01`.

You should see the data appearing in the IoT Server logs.

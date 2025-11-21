#ifndef CONFIG_H
#define CONFIG_H

// WiFi Credentials
static const char *WIFI_SSID = "YOUR_WIFI_SSID";
static const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT Broker Settings
static const char *MQTT_SERVER =
    "192.168.1.100"; // Replace with your server's IP
static const int MQTT_PORT = 1883;
static const char *MQTT_USER = ""; // Leave empty if anonymous
static const char *MQTT_PASSWORD = "";

// Device Settings
static const char *DEVICE_ID = "esp32_sensor_01";
static const char *MQTT_TOPIC = "heru/sensors/esp32_sensor_01";

// Pin Definitions
#define DHTPIN 4      // Digital pin connected to the DHT sensor
#define DHTTYPE DHT22 // DHT 22 (AM2302)

#endif

/***************************************************
  Adafruit MQTT Library ESP8266 Example
  Must use ESP8266 Arduino from:
    https://github.com/esp8266/Arduino
  Works great with Adafruit's Huzzah ESP board & Feather
  ----> https://www.adafruit.com/product/2471
  ----> https://www.adafruit.com/products/2821
  Adafruit invests time and resources providing this open source code,
  please support Adafruit and open-source hardware by purchasing
  products from Adafruit!
  Written by Tony DiCola for Adafruit Industries.
  MIT license, all text above must be included in any redistribution
 ****************************************************/
#include <IRremoteESP8266.h>
#include <IRsend.h>
#include <ESP8266WiFi.h>
#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"
#include "Samsung_Codes.h"
#include "Config.h"
/************ Global State (you don't need to change this!) ******************/

// Create an ESP8266 WiFiClient class to connect to the MQTT server.
//WiFiClient client;
// or... use WiFiFlientSecure for SSL
WiFiClientSecure client;

// Setup the MQTT client class by passing in the WiFi client and MQTT server and login details.
Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);

/****************************** Feeds ***************************************/
Adafruit_MQTT_Subscribe speaker = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/livingroom.speaker");
Adafruit_MQTT_Subscribe tv      = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/livingroom.tv");


int sendPin = D2;
IRsend irsend(sendPin);


// Bug workaround for Arduino 1.6.6, it seems to need a function declaration
// for some reason (only affects ESP8266, likely an arduino-builder bug).
void MQTT_connect();

void resetVolumeToZero(){
  irsend.sendSAMSUNG(VOLUME_DOWN, SAMSUNG_BITS, 10);  
}

/**
 * AdjustVolume : Alexa, turn the volume down on speaker by 20
 * SetVolume    : Alexa, set the volume of speaker to 50
 * TurnOn       : Alexa, turn on TV
 * TurnOff      : Alexa, turn off TV
 */
void sendIRCodeBasedOnAlexaCommand(const char* value){
  if (strcmp(value, "mute") == 0 || strcmp(value, "unmute") == 0){
    logMessage("Sending Volume to be :" + String(value), false);
    irsend.sendSAMSUNG(MUTE, SAMSUNG_BITS, 2); 
    return;    
  }
  if (strcmp(value, "ON") == 0 || strcmp(value, "OFF") == 0){
    logMessage("Sending TV to turn: " + String(value), false);
    irsend.sendSAMSUNG(ON_OFF, SAMSUNG_BITS);
    return;
  }
  int val = atoi(value);
  logMessage("atoi:" + String(val), false);
  if (val > 0) {
    // get the modulo and send the signal that many times
    // e.g. "Alexa set the volume of device to 50” so increse the volume 5 times
    int scaleIt = map(val, 0, 100, 0, 10);
    logMessage("+ve Value found: scaledTo:" + String(scaleIt), false);
    
    /* We are trying to bring the volume to zero by sending DOWN command "n" times    
     *  
     */
    resetVolumeToZero();
    
    delay(30);
    logMessage("Sending Volume_UP", false);
    irsend.sendSAMSUNG(VOLUME_UP, SAMSUNG_BITS, scaleIt);  
  }else {
    int scaleIt = abs((val * -1) / 10);
    logMessage("-ve Value found: scaledTo" + String(scaleIt), false);
    logMessage("Sending Volume_DOWN", false);
    irsend.sendSAMSUNG(VOLUME_DOWN, SAMSUNG_BITS, scaleIt);
    delay(30);    
  }
}

void wifiSetup() {
 
    // Set WIFI module to STA mode
    WiFi.mode(WIFI_STA);
 
    // Connect
    logMessage("[WIFI] Connecting to" + String(WIFI_SSID));
    WiFi.begin(WIFI_SSID, WIFI_PASS);
 
    // Wait
    while (WiFi.status() != WL_CONNECTED) {
        logMessage(".");
        delay(100);
    }
 
    // Connected!
    logMessage("[WIFI] STATION Mode, IP address:" + WiFi.localIP().toString(), true);
}

void setup() {
  #ifdef DEBUG
    Serial.begin(SERIAL_BAUDRATE);
  #endif
    
  delay(10);
  wifiSetup();  
  irsend.begin();
  // Setup MQTT subscription for onoff feed.
  mqtt.subscribe(&speaker);
  mqtt.subscribe(&tv);
}


void loop() {
  // Ensure the connection to the MQTT server is alive (this will make the first
  // connection and automatically reconnect when disconnected).  See the MQTT_connect
  // function definition further below.
  MQTT_connect();

  // this is our 'wait for incoming subscription packets' busy subloop
  // try to spend your time here

  Adafruit_MQTT_Subscribe *subscription;
  while ((subscription = mqtt.readSubscription(3000))) {    
    if (subscription == &speaker) {
      logMessage((char *)speaker.lastread, false);
      sendIRCodeBasedOnAlexaCommand((char *)speaker.lastread);
    }else if (subscription == &tv) {
      logMessage((char *)tv.lastread, false);
      sendIRCodeBasedOnAlexaCommand((char *)tv.lastread);
    }    
  }  
}

// Function to connect and reconnect as necessary to the MQTT server.
// Should be called in the loop function and it will take care if connecting.
void MQTT_connect() {
  int8_t ret;

  // Stop if already connected.
  if (mqtt.connected()) {
    return;
  }

  logMessage("Connecting to MQTT... ");

  uint8_t retries = 3;
  while ((ret = mqtt.connect()) != 0) { // connect will return 0 for connected
       logMessage(mqtt.connectErrorString(ret), true);
       logMessage("Retrying MQTT connection in 5 seconds...", false);
       mqtt.disconnect();
       delay(5000);  // wait 5 seconds
       retries--;
       if (retries == 0) {
         // basically die and wait for WDT to reset me
         while (1);
       }
  }
  logMessage("MQTT Connected!", false);
}

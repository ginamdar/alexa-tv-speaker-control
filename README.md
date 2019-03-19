# alexa-tv-speaker-control
Use Alexa Smart home skill to control your TV and Speaker using lambda function, basic circuit using ESP8266, IR Transmitter and simple sketch
This skill is specifically for older generation TV's which doesnt integrate with Google Home or Amazon Alexa.

## Setup

### Alexa Smart Home Skill
Create simple smart home alexa skill and point your lambda function for invokation
### Lamda Function
* TV-Speaker-Lambda/ has the code that basically takes user spoken request and store that to adafruit io feeds
* It also supports hardcoded device discovery request from Alexa along with interface supported. Alexa.Speaker and Alexa.PowerController.
* User can ask alexa 
``` 
set volume to 5
Mute the speaker
turn TV Off
turn TV On
etc..
``` 
This can further be extended to support channel controls or other TV functions

### Arduino Sketch
Sketch uses MQTT Api to listen on feeds for Tv and Speaker and sends Infrared IR Codes based on the message. This is very basic simple circuit that
uses ESP with small 5k resistor and IR transmitter

You may need to find out the codes for your Tv, you can search those on web or use another circuit using Arduino, IR Reciever and your TV Remote
to print the hex values for each function.

### 3rd party library
* for sending IR Code im using [@markszabo](https://github.com/markszabo/IRremoteESP8266)
* Using Adafruit IO to capture request from user via alexa.

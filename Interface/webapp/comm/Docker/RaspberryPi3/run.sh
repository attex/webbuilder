#!/bin/bash
mosquitto_pub -h 10.11.4.107 -t device-ras-001 -m "Handshake from RASPBERRYPI3"
for (( i=2; i <= 20; ++i ))
do
    echo 0 >/sys/class/leds/led0/brightness
    mosquitto_pub -h 10.11.4.107 -t device-ras-001 -m "LED turned off."
    sleep 3s
    echo 1 >/sys/class/leds/led0/brightness
    mosquitto_pub -h 10.11.4.107 -t device-ras-001 -m "LED turned on."

    sleep 1s
    echo helloWorld
done
mosquitto_pub -h 10.11.4.107 -t device-ras-001 -m "Done. Finishing..."

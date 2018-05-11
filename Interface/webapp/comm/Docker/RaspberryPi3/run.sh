#!/bin/bash
for (( i=2; i <= 20; ++i ))
do
    echo 0 >/sys/class/leds/led0/brightness
    sleep 1s
    echo 1 >/sys/class/leds/led0/brightness
    sleep 2s
    echo helloWorld
done

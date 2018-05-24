FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y mosquitto mosquitto-clients

CMD mosquitto_sub -t '#'

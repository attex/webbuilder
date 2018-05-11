FROM ubuntu:16.04

ARG DEVICEPATH=test
ARG PLATFORMFILE=test

RUN apt-get update
RUN apt-get install -y openssh-server network-manager
CMD nmcli device wifi connect rockrobo-vacuum-v1_miapDA8C


CMD ssh 192.168.8.1

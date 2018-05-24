FROM ubuntu:latest

ARG FILEPATH

ADD ./run.sh /opt/

RUN apt-get update
RUN apt-get install -y mosquitto-clients mosquitto
RUN chmod a+rwx /opt/
RUN chmod a+rwx /opt/run.sh


CMD /opt/run.sh

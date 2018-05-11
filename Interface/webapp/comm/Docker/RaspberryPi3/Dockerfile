FROM ubuntu:latest

ARG FILEPATH

ADD ./run.sh /opt/

RUN apt-get -y update
RUN apt-get install -y vim
RUN chmod a+rwx /opt/
RUN chmod a+rwx /opt/run.sh

CMD /opt/run.sh

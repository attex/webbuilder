FROM ubuntu:16.04

RUN DEBIAN_FRONTEND=noninteractive apt-get update -qq \
    && DEBIAN_FRONTEND=noninteractive apt-get install -yq


ENV PATH=/opt/esp-open-sdk/xtensa-lx106-elf/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

ADD ./build_toolchain.sh /opt
ADD ./build_n_flash.sh /opt

RUN DEBIAN_FRONTEND=noninteractive apt-get update -qq \
    && DEBIAN_FRONTEND=noninteractive apt-get install -yq \
	     make unrar-free autoconf automake libtool gcc g++ gperf \
	         flex bison texinfo gawk ncurses-dev libexpat-dev python-dev python python-serial \
	         sed git unzip bash help2man wget bzip2 libtool-bin \
	&& useradd -m -d /esp_master esp_master \
	&& mkdir /build \
	&& chmod a+rwx /build \
	&& chown esp_master:esp_master /build \
	&& chmod a+rwx /opt \
	&& chmod a+rwx /opt/build_toolchain.sh \
	&& chmod a+rwx /opt/build_n_flash.sh \
	&& su -c "/opt/build_toolchain.sh" -s /bin/sh esp_master

CMD /opt/build_n_flash.sh

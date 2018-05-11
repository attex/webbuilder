docker pull prom/prometheus

mkdir /opt/docker/prometheus
touch /opt/docker/prometheus/prometheus.yml
docker run -it -d --nano prometheus -p 9090:9090 -v /opt/docker/prometheus:/etc/prometheus -config.file /etc/prometheus/prometheus.yml
docker run -it -d -p 9090:9090 -v /opt/docker/prometheus:/etc/prometheus -config.file /etc/prometheus/prometheus.yml

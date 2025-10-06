ARG STACK_VERSION

FROM  docker.elastic.co/beats/filebeat:${STACK_VERSION:-9.1.3}
COPY ./config/filebeat.yml /usr/share/filebeat/filebeat.yml
USER root
RUN chown root:root /usr/share/filebeat/filebeat.yml && \
    chmod 644  /usr/share/filebeat/filebeat.yml

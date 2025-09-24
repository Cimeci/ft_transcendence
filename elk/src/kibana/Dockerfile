ARG STACK_VERSION

FROM  docker.elastic.co/kibana/kibana:${STACK_VERSION:-9.1.3}
COPY ./config/kibana.yml /usr/share/kibana/config/kibana.yml


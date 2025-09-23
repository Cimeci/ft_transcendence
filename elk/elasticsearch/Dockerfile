ARG STACK_VERSION

FROM  docker.elastic.co/elasticsearch/elasticsearch:${STACK_VERSION:-9.1.3}
COPY ./config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml


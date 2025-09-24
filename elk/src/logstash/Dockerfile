ARG STACK_VERSION

FROM  docker.elastic.co/logstash/logstash:${STACK_VERSION:-9.1.3}
COPY ./pipeline/logstash.conf /usr/share/logstash/pipeline/logstash.conf
COPY setup.sh /usr/local/bin/setup.sh

CMD ["/usr/local/bin/setup.sh"]

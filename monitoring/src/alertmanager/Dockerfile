
FROM alpine:3.20

RUN apk add --no-cache gettext curl tar && \
    curl -L "https://github.com/prometheus/alertmanager/releases/download/v0.28.1/alertmanager-0.28.1.linux-amd64.tar.gz" \
    | tar xz && \
    mv alertmanager-*/alertmanager /bin/alertmanager && \
    rm -rf alertmanager-*

COPY ./config/alertmanager.yml.template /etc/alertmanager/
WORKDIR /etc/alertmanager/

CMD sh -c "envsubst < alertmanager.yml.template > alertmanager.yml && exec /bin/alertmanager --config.file=/etc/alertmanager/alertmanager.yml --storage.path=/alertmanager"

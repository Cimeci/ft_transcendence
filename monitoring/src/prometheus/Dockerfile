FROM alpine:3.20 AS builder
ARG PROM_PASSWORD_HASH
RUN apk add --no-cache gettext
COPY ./config /tmp/config
RUN envsubst < /tmp/config/web.yml.template > /tmp/config/web.yml


FROM prom/prometheus:v3.6.0

COPY --from=builder /tmp/config /etc/prometheus

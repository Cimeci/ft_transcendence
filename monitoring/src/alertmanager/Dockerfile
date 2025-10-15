FROM alpine:3.20 AS builder
ARG DISCORD_HOOK_URL
RUN apk add --no-cache gettext
COPY config/alertmanager.yml.template /tmp
RUN envsubst < /tmp/alertmanager.yml.template > /tmp/alertmanager.yml

FROM prom/alertmanager:v0.28.1
COPY --from=builder /tmp/alertmanager.yml /etc/alertmanager/alertmanager.yml

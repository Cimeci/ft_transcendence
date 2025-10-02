FROM alpine:3.19
RUN apk add --no-cache curl jq ca-certificates openssl
WORKDIR /dashboards
COPY entrypoint.sh /entrypoint.sh
COPY dashboards /dashboards
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]


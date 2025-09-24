FROM alpine:3.19
RUN apk add --no-cache curl jq ca-certificates openssl
WORKDIR ./policies
COPY ./entrypoint.sh /entrypoint.sh
COPY ./policies /policies
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

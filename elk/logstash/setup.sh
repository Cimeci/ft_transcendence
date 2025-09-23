#!/bin/bash
set -e

export LOGSTASH_KEYSTORE_PASS=${LOGSTASH_KEYSTORE_PASS}

echo "=== DEBUGGING ==="
echo "User: $(whoami)"
echo "ELASTIC_USER: $ELASTIC_USER"
echo "ELASTIC_PASSWORD: $ELASTIC_PASSWORD" 
echo "ELASTIC_HOSTS: $ELASTIC_HOSTS"
echo "=================="


if [ ! -f /usr/share/logstash/config/logstash.keystore ]; then
    echo "Creating Logstash keystore"
    echo "y" | bin/logstash-keystore --path.settings /usr/share/logstash/config create -p "${LOGSTASH_KEYSTORE_PASS}"
    echo "${ELASTIC_PASSWORD}" | bin/logstash-keystore --path.settings /usr/share/logstash/config add ELASTIC_PASSWORD --stdin -p "${LOGSTASH_KEYSTORE_PASS}"
fi

exec /usr/share/logstash/bin/logstash


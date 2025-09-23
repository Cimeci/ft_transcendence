#!/bin/bash
set -e
       
# Check if the env settings are set
if [ x${ELASTIC_PASSWORD} == x ]; then
    echo "Set the ELASTIC_PASSWORD environment variable in the .env file";
    exit 1;
elif [ x${KIBANA_PASSWORD} == x ]; then
    echo "Set the KIBANA_PASSWORD environment variable in the .env file";
    exit 1;
fi;

# Create certs and unzip
if [ ! -f config/certs/ca.zip ]; then
    echo "Creating CA";
    bin/elasticsearch-certutil ca --silent --pem -out config/certs/ca.zip;
    unzip config/certs/ca.zip -d config/certs;
fi;


# Create certs deicated to each services
if [ ! -f config/certs/certs.zip ]; then
    echo "Creating certs";
    echo -ne \
    "instances:\n"\
    "  - name: es01\n"\
    "    dns:\n"\
    "      - es01\n"\
    "      - localhost\n"\
    "    ip:\n"\
    "      - 127.0.0.1\n"\
    "  - name: kibana\n"\
    "    dns:\n"\
    "      - kibana\n"\
    "      - localhost\n"\
    "    ip:\n"\
    "      - 127.0.0.1\n"\
    "  - name: logstash\n"\
    "    dns:\n"\
    "      - logstash\n"\
    "      - localhost\n"\
    "    ip:\n"\
    "      - 127.0.0.1\n"\
    "  - name: filebeat\n"\
    "    dns:\n"\
    "      - filebeat\n"\
    "      - localhost\n"\
    "    ip:\n"\
    "      - 127.0.0.1\n"\
    > config/certs/instances.yml;
    mkdir -p /usr/share/elasticsearch/config/certs;
    bin/elasticsearch-certutil cert --silent --pem -out config/certs/certs.zip --in config/certs/instances.yml --ca-cert config/certs/ca/ca.crt --ca-key config/certs/ca/ca.key;
    unzip config/certs/certs.zip -d config/certs;
fi;


# Set permissions on the files
echo "Setting file permissions"
chown -R root:root config/certs;
find . -type d -exec chmod 750 \{\} \;;
find . -type f -exec chmod 640 \{\} \;;    

echo "Setting permissions for Logstash user (1000)";
chown -R 1000:1000 /usr/share/elasticsearch/config/certs;
chmod -R 755 /usr/share/elasticsearch/config/certs; 


# Wait for ES
echo "Waiting for Elasticsearch availability";
until curl -s --cacert config/certs/ca/ca.crt https://es01:9200 | grep -q "missing authentication credentials"; do sleep 30; done;


## Set Kibana Passwrd
echo "Setting kibana_system password";
until curl -s -X POST --cacert config/certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://es01:9200/_security/user/kibana_system/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do sleep 10; done;


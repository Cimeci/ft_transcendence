#!/bin/sh
set -e   

until [ "$(curl -s -o /dev/null -w "%{http_code}" --cacert /certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" https://es01:9200)" -eq 200 ]; do
  sleep 5
done

echo "ES is up"


# Provisory tool to remove the old settings -> before creation [development tool]
echo "Cleaning existing transcendence resources (dev safety)"
curl --cacert /certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -X DELETE "https://es01:9200/transcendence-000001" || true
curl --cacert /certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -X DELETE "https://es01:9200/_data_stream/transcendence" || true
curl --cacert /certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -X DELETE "https://es01:9200/_index_template/transcendence-template" || true


# 1. ILM policy
echo "Creating ILM policy"
curl --cacert /certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" \
     -X PUT "https://es01:9200/_ilm/policy/transcendence" \
     -H "Content-Type: application/json" \
     --data-binary "@/policies/ilm-policy.json"

# 2. Index template
echo "Creating index template"
curl --cacert /certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" \
     -X PUT "https://es01:9200/_index_template/transcendence-template" \
     -H "Content-Type: application/json" \
     --data-binary "@/policies/template.json"

# 3. First backing index + alias
echo "Creating first backing index"
curl --cacert /certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" \
     -X PUT "https://es01:9200/transcendence-000001" \
     -H "Content-Type: application/json" \
     --data-binary "@/policies/first-index.json"


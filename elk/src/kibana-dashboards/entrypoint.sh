#!/bin/sh
set -e

echo "Import Application Overview Dashboard"
curl --cacert /certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" \
  -X POST "https://kibana:5601/kibana/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  -F file=@/dashboards/dashboard_app-overview.ndjson

curl --cacert /certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" \
  -X POST "https://kibana:5601/kibana/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  -F file=@/dashboards/dashboard_errors-security.ndjson

curl --cacert /certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" \
  -X POST "https://kibana:5601/kibana/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  -F file=@/dashboards/dashboard_performance.ndjson


#!/usr/bin/env bash
set -aeuo pipefail
source .env


echo "=== 1. Password complexity ==="
analyzer() {
    local str="$1"
    local letters=$(echo -n "$str" | grep -o "[A-Za-z]" | wc -l)
    local numbers=$(echo -n "$str" | grep -o "[0-9]" | wc -l)
    local specials=$((${#str} - letters - numbers))
    echo "[letters=$letters, numbers=$numbers, special=$specials]"
}

echo "ELASTIC_PASSWORD ${#ELASTIC_PASSWORD} chars"
analyzer "${ELASTIC_PASSWORD}" 
echo "KIBANA_PASSWORD ${#KIBANA_PASSWORD} chars"
analyzer "${KIBANA_PASSWORD}"


echo "=== 2. TLS version ==="
nmap --script ssl-enum-ciphers -p 9200 localhost | grep -E 'TLSv1.0|TLSv1.1' && echo "❌ Weak TLS" || echo "✅ OK"


echo "=== 3. Anonymous access ==="
curl -sk https://localhost:9200/ | grep -q "missing authentication credentials" && echo "✅ Auth required" || echo "❌ Anonymous OK"


echo "=== 4. Kibana_system user ==="
curl -sk -u "kibana_system:$KIBANA_PASSWORD" https://localhost:9200/ >/dev/null && echo "✅ kibana_system OK" || echo "❌ kibana_system FAIL"

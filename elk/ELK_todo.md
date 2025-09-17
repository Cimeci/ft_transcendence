## Security

[x] Simple script tester
[ ] Check leaks from images
[ ] Ports 9200/5601 non exposés sur 0.0.0.0 en production ? [ss -tulnp]
[x] TLS 1.2+ et certificats sha256
[x] Auth obligatoire sur ES + Kibanax
[x] Audit logging -> Only available on trial
[x] Use a Logstash Keystore
[x] Droits 640/750 sur les certificats
[ ] Backup & retention documentés
[x] HTTPS KIbana
[ ] Filebeat Keystore ?
[ ] Remove ports settings in the compose


## Completing setup
[ ] Kibana.yml
[ ] Handle filter from Logstash,conf
[ ] Add Restart Policy
[ ] Change volumes logs (not the default one in compose)

## Functionnality
[ ] Add a fake web app and handle logs


## Adds
[ ] Rename services (Logstash01 why ?)
[ ] Clean code
[ ] Write simple documentation
[ ] Add a Stack Monitoring with MetricBeats /!\ If it's possible without docker sockets
[ ] Rotation ?

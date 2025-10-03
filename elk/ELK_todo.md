# Security
[x] Simple script tester
[ ] Check leaks from images
[ ] Check if expose port on 0.0.0.0 is a good production idea (ss -tunlp)
[x] Backup & retention
[ ] Filebeat Keystore ?

# Completing setup
[x] Kibana.yml
[x] Handle filter from Logstash.conf
[x] Add Restart Policy
[x] Change volumes logs (not the default one in compose)
[x] Persistence queue ?
[ ] Add Healthcheck to the filebeat service
[ ] Log4j2 configuration logs for Elastic

# Functionnality
[x] Add fake web app logs (check if the harvesters are ok)
[x] Rotation
[x] Issue "Health" index into Kibana
[x] Verify a docker compose down + docker compose up is working (persistence datas)

# Littles Adds
[x] Check about labels docker -> specificly into the filebeat
[ ] If a second node is added => Define 1 shard into the template.json
[ ] Look how handle keystore with elk-certs container (es-certutil)
[ ] Add a logrotate service + modify name pattern into Filebeat.conf

# Clean Code
[ ] Remove dev suppressions into entrypoin.sh from bootstrap-ilm =>  /!\ very important to keep a functionnal stack !!!
[x] Clean Docker compose -> use Dockerfiles and configurations files 
[ ] Defined ports into the .env 




# Documentation Specs
[ ] Specifications about root (subject reference)
[ ] Specifications about env

## Security concern

The `elk_certs` container is builed from an Elasticsearch image, which contianed elastic-certutil and allow to create different certificate.
Each service (or node from ES) can communicate with a mutually certification (mTLS). Each service as is own certificate, signed by the intern CA `ca.crt` (wich is a way to trust all the differents certificates).


## Template and ILM Policies

The "" container wait before the ElasticSearch fonctionement and use the REST API to
- PUT our policies files settings
- PUT our index template
- PUT our first index


### Rollover

We create an Alias `transcendence` pointing to the real current index, specified by a number, `transcendence-000001` for the exemple
That's means we got after a rollover we got
```
transcendence (ALIAS) 
    ↓ pointing to  
transcendence-000002 (New Index, actif to the writing)

transcendence-000001 (Old Index, read only)
```

### Retention

We autamtized suppression after to olf indices


## Kibana Dashboards

As this stack is dedicated to a school project and cannot be maintained on a server permenantly, we couldn't create dashboards from the Kiban UI and just save it. To prevent this issue, we export 3 Dashboards vues and set a kibana-dashboards container, build from an Alpine image and use the REST API to POST the ndjson dashboards.
[ ] HERE ADD SOME EXPLAINATION ABOUT THE 3 DASHBOARDS AND ADD SCREENSHOTS


## Improvments

Because this is a school project working into a limited environment, We don't need to handle persistant queue. There is not critical data in our production or audit. As we don't want to have a overhead memory (LG is alredy limited to 1GB)


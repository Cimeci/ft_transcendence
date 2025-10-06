# Security
[x] Simple script tester
[x] Check if expose port on 0.0.0.0 is a good production idea (ss -tunlp)
[x] Backup & retention
[x] Filebeat Keystore ?

# Completing setup
[x] Kibana.yml
[x] Handle filter from Logstash.conf
[x] Add Restart Policy
[x] Change volumes logs (not the default one in compose)
[x] Persistence queue ?
[x] Add Healthcheck to the filebeat service
[x] Log4j2 configuration logs for Elastic

# Functionnality
[x] Add fake web app logs (check if the harvesters are ok)
[x] Rotation
[x] Issue "Health" index into Kibana
[x] Verify a docker compose down + docker compose up is working (persistence datas)

# Littles Adds
[x] Check about labels docker -> specificly into the filebeat
[x] If a second node is added => Define 1 shard into the template.json
[x] Look how handle keystore with elk-certs container (es-certutil)
[x] Add a logrotate service + modify name pattern into Filebeat.conf

# Clean Code
[x] Remove dev suppressions into entrypoin.sh from bootstrap-ilm =>  /!\ very important to keep a functionnal stack !!!
[x] Clean Docker compose -> use Dockerfiles and configurations files 
[ ] Add a gitignore (with the .env)
[x] Add dockerignore everywhere
[x] Logstash https healtcheck



## ELK Documentation
[ ] Specifications about root (subject reference)
[ ] Specifications about env

### Virtual Machine env

As the subject specifies it itself

>Several container technologies exist: Docker, containerd, podman,
etc. On the computers of your campus, you may access the container
software in rootless mode for security reasons. This could lead to
the following extra constraints:
• Your runtime needs to be located in /goinfre or /sgoinfre.
• You are not able to use “bind-mount volumes” between the host
and the container if non-root UIDs are used in the container.
Depending on the current requirements of the subject (highlighted in
green above) and the local configuration in clusters, you may need to
adopt different strategies, such as: container solution in virtual
machine, rebuild your container after your changes, craft your own
image with root as unique UID.

Nous avons donc fait le choix de constuire notre projet dans une machine virtualle car:
- Les containers rootless du campus limitent bind-mounts et options mémoire/JVM.
- La stack ELK nécessite ces fonctionnalités pour fonctionner correctement (et nous sommes limités en RAM et esapce disque sur nos machines)
- La VM permet de retrouver un environnement root complet et d’utiliser Docker normalement.


### Stack and Component

The subject specifies a ELK (ES, Logstash, Kibana) tools are needed. Mais pour garder uns stack légère nous avons choisi d'utiliser FIlebeat qui assure la seule ingestion des logs et leur envoi à Logstash pour plusieurs raisons:
- Plus léger que Logstash (failble consommation mémoire et CPU)
- Il gère seul le offset tracking (pas de doublon si redémarrage)
- Garde les logs en buffer le tempsque LOgstash ne réponde
- Peut gérer à lui seul les ilm policies (mais nous avons découvert que passer par Logstash en intermédiaire de ES enpçhe cette feature)
- Logstash a une seule tâche d'enrichissement des logs et est donc plus performant

-> Ajouter un schéma de la satck avec ses ports

La stack tourne en mode basic donc certains Warning sont proc au lancement (IA Asssistant ou AWS S3 Region). Ces outils ne sont pas utilisés donc les logs sont à ignorer.




### Security concern

The `elk_certs` container is builed from an Elasticsearch image, which contianed elastic-certutil and allow to create different certificate.
Each service (or node from ES) can communicate with a mutually certification (mTLS). Each service as is own certificate, signed by the intern CA `ca.crt` (wich is a way to trust all the differents certificates).


### Template and ILM Policies

The "" container wait before the ElasticSearch fonctionement and use the REST API to
- PUT our policies files settings
- PUT our index template
- PUT our first index


We create an Alias `transcendence` pointing to the real current index, specified by a number, `transcendence-000001` for the exemple
That's means we got after a rollover we got
```
transcendence (ALIAS) 
    ↓ pointing to  
transcendence-000002 (New Index, actif to the writing)

transcendence-000001 (Old Index, read only)
```

We autamtized suppression after to olf indices


### Kibana Dashboards

As this stack is dedicated to a school project and cannot be maintained on a server permenantly, we couldn't create dashboards from the Kiban UI and just save it. To prevent this issue, we export 3 Dashboards vues and set a kibana-dashboards container, build from an Alpine image and use the REST API to POST the ndjson dashboards.
[ ] HERE ADD SOME EXPLAINATION ABOUT THE 3 DASHBOARDS AND ADD SCREENSHOTS


### Possible Improvments

As this transcendence project is build from a limited school environment with educationnal concerns and not real production contraints, we choose to skip some possible imporvement, frequently used in a ELK stack to keep a KISS workflow (Kit It Simple, Stupid):
- Persistant Queue: There is not critical data in this production, there isn't any audit and we can restart easily the backend for new logs and loose the old ones. We don't want as well to have an overhead memory (LG is alredy limited to 1GB).
- Keystores and sensibles datas: We wanted to test how handle Keystore in this kind of project. Create one for Logstash was pretty simple but we was lock by some issues with the Kibana-keystore manager. To simplify the setup in Docker Compose, we limited the use of the keystore to Logstash, which is the service most exposed to external integrations. For other services, we used Docker environment variables. In a real production, secrets would be handle by a an orchestrator (Docker Swarn or Kubernetees) or Vault (HashiCorp).
- Multi-node Cluster: For now our cluster is a single-node one with a master node indexing all the datas from Logstash. A good improvment could be adding a second one for split the "master" node from the "data" node. But this architetcture could lead some memory and ressources issues we don't want to handle hre.


### Sources
- [Offcial ELK Doc](https://www.elastic.co/docs/solutions/search)
- [Official Docker Doc](https://docs.docker.com/reference/)
- [Official Pino Doc](https://getpino.io/#/docs/redaction)
- [Guides ELK (little outdated but a good start](https://www.elastic.co/fr/blog/author/eddie-mitchell)
- [Repo inspiration](https://github.com/deviantony/docker-elk)

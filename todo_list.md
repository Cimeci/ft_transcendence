### Last verifications
[ ] Leaks from the docker images
[ ] .dockerignore on all containers
[ ] .gitignore (no env !!)
[ ] change all the var from ELK compose (pass only the env var or assign default value)
[ ] check ARG after FROM statement into ELK DOCKERS
[ ] rm all local spécifications on compose general
[ ] renommer les volumes proprement

### Workflows
[ ] Create `frontend` and `fullstack` Makeffile rule
[ ] Create container for Frontend
[ ] Need a network for frontend ??

### Documentation
[ ] Details about the .env
[ ] Add all sources

### https
[ ] Generer des certificats SSL/TLS
[ ] Configuration pour chaque service 
[ ] Mettre a jour les reverse proxy
[ ] Mettre a jour les URLs dans le frontend et les configs

### Tests en production
[ ] Vérifier que pas d'erreur 504 dans le reverse-proxy avec Kibana (ajouter un buffer ou timeout dans nginx)
[ ] Vérifier les metrics des applications en condition de production


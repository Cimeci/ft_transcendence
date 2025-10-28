### Last verifications
- [x] .dockerignore on all containers
- [x] .gitignore (no env !!)
- [x] change all the var from ELK compose (pass only the env var or assign default value)
- [x] check ARG after FROM statement into ELK DOCKERS
- [x] rm all local spécifications on compose general
- [x] renommer les volumes proprement
- [x] rename le network backend -> app

### Workflows
- [x] Create `frontend` and `fullstack` Makeffile rule
- [x] Create container for Frontend

### Documentation
- [ ] Details about the .env
- [x] Add all sources

### https
- [x] Generer des certificats SSL/TLS
- [x] Configuration pour chaque service 
- [x] Mettre a jour les reverse proxy
- [x] Mettre a jour les URLs dans le frontend et les configs

### Tests en production
- [ ] Vérifier que pas d'erreur 504 dans le reverse-proxy avec Kibana (ajouter un buffer ou timeout dans nginx)
- [ ] Vérifier les metrics des applications en condition de production


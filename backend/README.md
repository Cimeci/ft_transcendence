1. Lancement du backend (Fastify + node.js)

- creer un dossier Backend
- faire la commande npm init -y (permet d'initialiser un projet Node.js, creant un fichier package.json avec des valuers par default)
- faire la commande npm i fastify (installe le framework Fastify)

2. Comprehension des besoins

- Gérer les utilisateurs (inscription, connexion, profil)
- Gérer les matchs et tournois
- Offrir une API REST performante
- Gérer les WebSockets pour le jeu temps réel
- Authentification sécurisée (via JWT)
- Connexion à une base SQLite
- (Interaction possible avec la blockchain (scores))

3. Definir l'architecture de projet


Semaine 1: Base projet + API REST
    1. Initialisation du projet
    2. Mise en place de la structure de dossier
    3. Plugin SGLite
    4. Schemas de validation
    5. Routes REST
    6. Chargement automatique des routes et plugins
    7. Test manuels (Postman)


Microservices: 

La conteneurisation de microservices avec Docker implique la creation d'un Dockerfile contenant des instructions pour construire une image Docker.

1ere partie: Faire un dockerfile pour 1 service 

    - Defininir l'image de base

    L'instruction FROM specifie l'image de base pour construire une image Docker et doit etre la premiere mention listee dans le fichier. L'image de base est la premiere couche vierge qui vous donne le controle de ce que votre image finale contiendra. Il peut s'agir d'une image officielle Docker comme BusyBox ou CentOS. Alternativement, il peut s'agir d'une image de base personnalisee qui inclut des logiciels supplementaires et des dependances dont vous avez besoin pour votre image.

    EX : "FROM node:14-alpine"

    - Fixer le repertoire

        La commande suivante est l'instruction WORKDIR. Cette commande definit le repertoire actif sur lequel s'executent toutes les commandes suivantes. C'est similaire a l'execution de la commande "cd" a l'interieur du conteneur.
        
        EX: "WORKDIR /usr/src/app"

    - Copier le code de la source

        La commande suivante est COPY, elle copie des fichiers d'un emplacement a un autre. Lorsque l'image est construite, les fichiers specifies sont copies du repertoire d'application hote vers le repertoire de travail specifie (WORKDIR).
        Une commande similaire a COPY est la commande ADD, qui remplit la meme donction mais egalement gerer des URL distantes et des fichiers compresses de decompression.

        EX: "COPY ["package.json", "package-lock.json", "./"]"

    - installer les dependances

        La commande RUN appelle l'installation d'applications de conteneurs ou de dependances de paquets. a l'etape precedente, nous avons defini une directive pour copier les fichiers de dependance. Ici, vous devez spécifier une commande qui installe ces dépendances. 
        bonus: npm ci -> ci est une commande distincte de install (clean-install)
            - lit exclusivement le fichier package-lock.json
            - supprime node_modules puis réinstalle toutes les dépendances exactement comme lockées
            - échoue si le lockfile est absent ou incohérent avec package.json
            - est plus rapide et reproductible que npm install dans un environnement CI ou une image Docker

        EX: "RUN npm install"

    - Copier au repertoire de travail

        Une commande COPY copie tout le code source de l'application de l'hôte au répertoire de travail du conteneur précédemment spécifié. Étant donné que les fichiers de dépendance du paquet ont déjà été copiés et installés, le conteneur dispose désormais de tout ce dont l'application a besoin pour fonctionner avec succès.

        EX: "COPY .."

    - Executer le port de service

        La commande EXPOSE n'ouvre pas les ports. Il indique simplement à Docker quel port l'application écoute pour le trafic.

        EX: "EXPOSE 3001"

    - Executer la demande

        Enfin, CMD definit la commande que vous souhaitez executer lors de l'execution d'un conteneur a partir d'une image

    ca donne ca pour transc:
    ```
        FROM node:20-slim
        WORKDIR /app
        COPY package.json .
        COPY package-lock.json .
        RUN npm ci --only=production
        COPY . .
        EXPOSE 3000
        CMD ["node", "src/tournament/tournament.js"]
    ```

    c'est un dockerfile pour lancer en solo un service en particulier. ou les package*.json sont a la racine du projet et pas dans le dossier du service en question.
    et pour lancer le tout il faut faire:
    docker build -f src/tournament/Dockerfile -t tournament-sevice .
    docker run -p 3000:3000 --name tournament-container tournament-service

    a note que npm ci --only=production ne peut etre mit que s'il y a un package-lock.json de copie. et qu'on met node:20-slim et pas node:24-slim car la derniere version de node est trop recente donc il n'y a pas de binaire pre-compile de better-sqlite3.

2eme partie: lancement de tout les services ensemble

    comme pour inception faire un .yml a la racine du projet avec chaque service ou chacun est sur le meme network. 
    pour cette partie ne pas expose le meme port pour tous sinon il y aura un conflit sur l'hote ce qui donne ca:

    services:
        auth:
            ports:
            - "3001:3000"
        game:
            ports:
            - "3002:3000"
        tournament:
            ports:
            - "3003:3000"
        user:
            ports:
            - "3004:3000"

    et rajouter un package.json dans chaque dossier de service pour que les docker puisse avoir acces a ceux ci. (2eme option c'est de changer le context dans le .yml: "build: context: . dockerfile: src/auth/Dockerfile)

    puis enfin lancer le tout avec: docker compose up -build.
    les services vont etre sur:
        -   Auth : http://localhost:3001
        -   Game : http://localhost:3002
        -   Tournament : http://localhost:3003
        -   User : http://localhost:3004

3eme partie: rajouter un proxy

    le proxy est un intermediaire qui recoit une requete, la transmet a quelqu'un d'autre et vous renvoie la reponse.
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

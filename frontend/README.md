# Front-end

## Launch front

<details>
<summary><h2>If nvm not install</h2></summary>

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

```
source ~/.zshrc
```

</details>

```
nvm install v20
```

```
nvm use v20
```

```
source ~/.zshrc
```

```
pwd
```
-> ft_transcendence

```
npx vite
```

Open in your browser : http://localhost:5173

voila c'est pour toi:

Pour implémenter une fonctionnalité de jeu en ligne avec des WebSockets, tu dois gérer la communication entre le front-end et le back-end de manière à synchroniser l'état du jeu entre tous les joueurs connectés. Voici ce que tu peux envoyer du côté front-end au back-end et du back-end au front-end :

### De Front à Back

1. **Actions du Joueur**:
   - Déplacements des raquettes (par exemple, "w", "s" pour le joueur 1 et "ArrowUp", "ArrowDown" pour le joueur 2).
   - Autres actions spécifiques au jeu (par exemple, accélérer la balle avec "e").

   **Exemple de message envoyé au back-end**:
   ```json
   {
     "action": "move",
     "paddle": "left",
     "direction": "up"
   }
   ```

2. **État Initial du Jeu**:
   - Informations sur les joueurs (noms, scores).
   - Paramètres du jeu (taille de la balle, vitesse initiale, etc.).

   **Exemple de message envoyé au back-end**:
   ```json
   {
     "playerName": "Player1",
     "initialScore": 0
   }
   ```

### De Back à Front

1. **Mises à Jour de l'État du Jeu**:
   - Nouvelles positions des raquettes.
   - Nouvelle position de la balle.
   - Mises à jour des scores.

   **Exemple de message reçu du back-end**:
   ```json
   {
     "ball": { "x": 350, "y": 400, "radius": 20, "speedX": 5, "speedY": 5 },
     "paddles": [
       { "player": "left", "x": 10, "y": 300 },
       { "player": "right", "x": 1390, "y": 300 }
     ],
     "scores": { "left": 1, "right": 0 }
   }
   ```

2. **Événements de Jeu**:
   - Détectations de collision.
   - Fin de partie.
   - Autres événements spécifiques au jeu.

   **Exemple de message reçu du back-end**:
   ```json
   {
     "event": "collision",
     "player": "left",
     "message": "Ball hit the left paddle!"
   }
   ```

3. **Notifications**:
   - Notifications pour les joueurs (par exemple, "Serveur surchargé", "Partie terminée").

   **Exemple de message reçu du back-end**:
   ```json
   {
     "notification": "Game Over",
     "message": "The game has ended. Final score: Player1: 5, Player2: 3"
   }
   ```

### Logique de Communication

#### Front-End

1. **Établir une Connexion WebSocket**:
   ```javascript
   const socket = new WebSocket('ws://serveur-de-jeu.com/ws');
   ```

2. **Envoyer des Actions au Serveur**:
   ```javascript
   function sendAction(action) {
     socket.send(JSON.stringify(action));
   }
   ```

3. **Recevoir des Mises à Jour du Jeu**:
   ```javascript
   socket.onmessage = (event) => {
     const update = JSON.parse(event.data);
     // Mettre à jour l'état du jeu côté client
     updateGame(update);
   };
   ```

4. **Gérer les Événements de Jeu**:
   ```javascript
   socket.onmessage = (event) => {
     const gameEvent = JSON.parse(event.data);
     // Traiter l'événement de jeu côté client
     handleGameEvent(gameEvent);
   };
   ```

#### Back-End

1. **Gérer les Connexions des Joueurs**:
   ```javascript
   app.get('/ws', { websocket: true }, (socket, req) => {
     console.log('Joueur connecté');
     // Gérer les événements de la connexion
   });
   ```

2. **Recevoir les Actions des Joueurs**:
   ```javascript
   socket.on('message', (message) => {
     const action = JSON.parse(message);
     // Traiter l'action (par exemple, mettre à jour la position du joueur)
   });
   ```

3. **Envoyer des Mises à Jour du Jeu aux Joueurs**:
   ```javascript
   const update = { ball, paddles, scores };
   socket.send(JSON.stringify(update));
   ```

4. **Gérer les Événements de Jeu**:
   ```javascript
   const event = { type: 'collision', player: 'player1' };
   socket.send(JSON.stringify(event));
   ```

### Conclusion

En résumé, tu peux envoyer des actions du joueur et des informations initiales du jeu au back-end, et recevoir des mises à jour de l'état du jeu, des événements de jeu et des notifications du back-end. Cette communication permet de synchroniser l'état du jeu entre tous les joueurs connectés et de créer une expérience de jeu en temps réel.
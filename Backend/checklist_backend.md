# Checklist Backend ft_transcendence

## 1. Authentification & Sécurité
- [x] Authentification JWT pour toutes les routes utilisateur (hors internes)
- [x] Vérification du token sur chaque endpoint sensible
- [ ] Gestion des erreurs JWT (token expiré, invalide, etc.)
- [ ] Protection contre brute-force/login abuse (rate limiting, éventuellement) (on le fait pas)

## 2. Utilisateur
- [x] Création d’utilisateur (avec historique associé)
- [x] Mise à jour du profil (email, username, avatar)
- [x] Mise à jour du statut en ligne
- [?] Validation forte des inputs (username, email, avatar)
- [?] Endpoint pour récupérer le profil d’un utilisateur (GET /user/:uuid)
(fait mais voir pour rajouter des choses)
- [ ] Endpoint pour récupérer la liste des utilisateurs (pour recherche/ajout d’amis)
- [x] Endpoint pour suppression de compte

## 3. Amis (Friendship)
- [x] Envoi de demande d’ami (POST /friendship/:uuid)
- [x] Acceptation/refus de demande (PATCH /friendship/:uuid)
- [x] Suppression d’une amitié (DELETE /friendship/:uuid)
- [x] Listing des amitiés, demandes envoyées/reçues (GET /friendship)
- [x] Vérification que l’utilisateur ne peut pas s’ajouter lui-même
- [x] Vérification que la demande n’existe pas déjà
- [ ] Gestion des erreurs et statuts HTTP cohérents
- [x] Pagination sur la liste des amis/demandes si besoin

## 4. Historique
- [x] Mise à jour de l’historique de jeu (PATCH /historic, interne)
- [?] Endpoint pour récupérer l’historique d’un utilisateur (GET /historic/:uuid) (fais direct dans GET /me)
- [ ] Calcul et stockage des stats (win, ratio, etc. – voir commentaire dans le code)
- [x] Protection contre modification non autorisée

## 5. Tournois (si dans le sujet)
- [ ] Endpoints pour création, gestion, inscription, historique de tournoi
- [ ] Stockage des stats tournoi dans historic

## 6. Microservices & Communication Interne
- [x] Sécurisation des endpoints internes via x-internal-key
- [ ] Documentation claire sur les endpoints internes vs externes

## 7. Robustesse & Qualité
- [ ] Gestion exhaustive des erreurs (messages clairs, statuts HTTP corrects)
- [ ] Logs d’erreur et monitoring
- [ ] Tests unitaires et d’intégration (routes, logique métier)
- [ ] Documentation des endpoints (README ou Swagger)

## 8. Divers
- [ ] Respect des conventions REST (statuts, verbes, structure)
- [ ] Protection contre injection SQL (paramétrage OK avec better-sqlite3)
- [ ] Sécurité des données sensibles (hash du mot de passe, pas de retour du hash)
- [ ] Pagination et filtres sur les endpoints de liste

---

### Mapping direct sujet/code
- Authentification: OK, mais à renforcer (gestion d’erreur, endpoints login/register si besoin)
- Utilisateur: CRUD partiel, manque endpoints de récupération/suppression
- Amis: CRUD OK, à renforcer sur la robustesse et la pagination
- Historique: Update OK, manque lecture/stats
- Tournoi: À vérifier selon le PDF, peu présent dans le code
- Sécurité: Bonne base, à compléter sur la gestion d’erreur et la documentation

Si tu veux un mapping encore plus précis (ex : “page 3 du PDF, section 2.1 = endpoint X”), il faut me donner le PDF ou ses sections : je peux alors faire le lien point par point entre le sujet et ton code.

Dis-moi si tu veux ce mapping ultra-détaillé !

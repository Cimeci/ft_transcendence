import fastify from "fastify";
import fastifyMetrics from 'fastify-metrics'; 
import Database from 'better-sqlite3/lib/database.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import jwt from '@fastify/jwt';

dotenv.config();

// Configuration du logger fastify
const loggerConfig = {
    transport: {
        target: 'pino/file',
        options: {
            destination: '/var/log/app/tournament-service.log',
            mkdir: true
        }
    },
    redact: ['password', 'hash', 'JWT_SECRET', 'uuid'],
    base: { service: 'tournament'},
    formatters: { time: () => `,"timestamp":"${new Date().toISOString()}"` }
}

const app = fastify({ logger: loggerConfig });

await app.register(fastifyMetrics, { endpoint: '/metrics' });

await app.register(jwt, {
  secret: process.env.JWT_SECRET,
  sign: { expiresIn: '2h' }
});

const db = new Database('./data/tournament.sqlite');

const tournament = `
    CREATE TABLE IF NOT EXISTS tournament (
        uuid TEXT PRIMARY KEY ,
        host TEXT NOT NULL,
        name TEXT NOT NULL,
        size INTEGER,
        players JSON,
        game JSON NOT NULL,
        winner TEXT,
        visibility INTEGER,
        password TEXT,
        launch INTEGER,
        current_match TEXT,
        status TEXT DEFAULT 'waiting'
    );
`

db.exec(tournament);
app.addHook('onClose', async (instance) => {
    db.close();
});

app.get('/tournament', async (request, reply) => {
    try {
        await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-user-infos_attempt'
        }, 'Get User Infos Unauthorized: invalid jwt token');
        return reply.code(401).send({ error: 'Unauthorized'});
    }

    try {
        const tournaments = db.prepare('SELECT * FROM tournament').all();
        request.log.info({
            event: 'get-all-tournament_attempt'
        }, ' Get All Tournament success');
        reply.send(tournaments);
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'get-all-tournament_attempt'
        }, 'Get All Tournament failed: Impossible to get tournaments');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/tournament/:uuid', async (request, reply) => {
    const { uuid } = request.params;

    try {
        const tournament = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid);
        if (!tournament) {
            request.log.warn({
                event: 'get-tournament_attempt',
            }, 'Get Tournament Failed: Tournament not found');
            return reply.code(404).send({ error: 'Tournament not found' });
        }
        request.log.info({
            event: 'get-tournament_attempt'
        }, ' Get Tournament sucess');

        reply.send(tournament);
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'get-tournament_attempt'
        }, 'Get Tournament failed: Impossible to get tournament');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/tournament', async (request, reply) => {
    try {
        await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-user-infos_attempt'
        }, 'Get User Infos Unauthorized: invalid jwt token');
        return reply.code(401).send({ error: 'Unauthorized'});
    }

    const { host_uuid, name, visibility, password, length } = request.body;
    const uuid = crypto.randomUUID();

    if (!host_uuid || !name || length < 2) {
        request.log.warn({
            event: 'new-tournament_attempt'
        }, 'New Tournament Failed: Invalid input');
        return reply.code(400).send({ error: 'Invalid input' });
    }

    try {
        const players = [];
        const matches = [];
        const totalRounds = Math.ceil(Math.log2(length));
        
        // Créer tous les matchs d'abord
        let currentMatchIndex = 0;
        for (let round = 1; round <= totalRounds; round++) {
            const matchesInRound = Math.pow(2, totalRounds - round);
            
            for (let i = 0; i < matchesInRound; i++) {
                matches.push({
                    uuid: crypto.randomUUID(),
                    round: round,
                    match_number: currentMatchIndex,
                    match_index_in_round: i,
                    player1_uuid: null,
                    player2_uuid: null,
                    winner_uuid: null,
                    status: 'waiting',
                    game_uuid: null,
                    next_match_index: null
                });
                currentMatchIndex++;
            }
        }
        
        // calcul next_match_index pour chaque match
        let matchesByRound = {};
        matches.forEach(match => {
            if (!matchesByRound[match.round]) {
                matchesByRound[match.round] = [];
            }
            matchesByRound[match.round].push(match);
        });
        
        // Pour chaque round sauf le dernier (finale), assigner next_match_index
        for (let round = 1; round < totalRounds; round++) {
            const currentRoundMatches = matchesByRound[round];
            const nextRoundMatches = matchesByRound[round + 1];
            
            if (currentRoundMatches && nextRoundMatches) {
                currentRoundMatches.forEach((match, idx) => {
                    // Deux matchs consécutifs du round actuel alimentent un match du round suivant
                    const nextMatchIndexInRound = Math.floor(idx / 2);
                    const nextMatch = nextRoundMatches[nextMatchIndexInRound];
                    
                    if (nextMatch) {
                        match.next_match_index = nextMatch.match_number;
                    }
                });
            }
        }

        players.push({uuid: host_uuid});
        matchesByRound = {};
        matches.forEach(m => {
            if (!matchesByRound[m.round]) matchesByRound[m.round] = 0;
            matchesByRound[m.round]++;
        });
        
        const playersJSON = JSON.stringify(players);
        const matchJSON = JSON.stringify(matches);

        db.prepare('INSERT INTO tournament (uuid, host, name, size, players, game, winner, visibility, password, launch, current_match, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(uuid, host_uuid, name, length, playersJSON, matchJSON, null, visibility, password, 0, null, 'waiting');
        request.log.info({
            event: 'new-tournament_attempt'
        }, 'New Tournament Created Success');
        return { message: 'Tournament created successfully', matches, uuid: uuid };
    } catch(err){
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'new-tournament_attempt'
        }, 'New Tournament failed with error');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.patch('/join', async (request, reply) => {
    let uuidPlayer;
    try {
        uuidPlayer = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'tournament-join_attempt'
        }, 'Tournament Join Unauthorized: invalid jwt token');
        return reply.code(401).send({ error: 'Unauthorized'});
    }

    const { uuid_tournament } = request.body;

    if (!uuid_tournament){
        request.log.warn({
            event: 'tournament-join_attempt'
        }, 'Tournament Join Failed: Missing uuid tournament');
        return reply.code(400).send({ error: 'Invalid input' });
    }

    try {
        const tournament = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid_tournament);
        if (!tournament) {
            request.log.warn({
                event: 'tournament-join_attempt'
            }, 'Tournament Join Failed: Tournament not found');
            return reply.code(404).send({ error: 'Tournament not found' });
        }
        
        const players = tournament.players ? JSON.parse(tournament.players) : [];

        const playerExists = players.some(player => player.uuid === uuidPlayer);

        //? Si le joueur est déjà inscrit, retourner succès sans modifier
        if (playerExists) {
            request.log.info({
                event: 'tournament-join_attempt'
            }, 'Tournament Join Success: Player already in tournament, allowing re-entry');
            return reply.send({
                success: true,
                message: 'Player already in tournament',
                already_joined: true,
                tournament: { ...tournament, players: players }
            });
        }

        //? Vérifier qu'il y a de la place pour un nouveau joueur
        if (players.length >= tournament.size) {
            request.log.warn({
                event: 'tournament-join_attempt'
            }, 'Tournament Join Failed: Tournament is full');
            return reply.code(400).send({ error: 'Tournament is full' });
        }

        //? Ajouter le nouveau joueur
        players.push({ uuid: uuidPlayer });
        db.prepare('UPDATE tournament SET players = ? WHERE uuid = ?').run(JSON.stringify(players), uuid_tournament);

        request.log.info({
            event: 'tournament-join_attempt'
        }, 'Tournament Join Success: Player added to tournament');
        reply.send({
            success: true,
            message: 'Player added to tournament',
            tournament: { ...tournament, players: players }
        });
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'tournament-join_attempt'
        }, 'Tournament Join Failed');
        reply.code(500).send({ error: 'Internal Server Error' });   
    }
});

app.patch('/tournament/:uuid', async (request, reply) => {
    const { uuid } = request.params;
    const { uuid_player } = request.body;

    if (!uuid_player){
        request.log.warn({
            event: 'tournament-winner_attempt'
        }, 'Tournament Winner Failed: Missing uuid player');
        return reply.code(400).send({ error: 'Invalid input' });
    }
    
    try {
        const tournament = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid);
        if (!tournament) {
            request.log.warn({
                event: 'tournament-winner_attempt'
            }, 'Tournament Winner Failed: Tournament not found');
            return reply.code(404).send({ error: 'Tournament not found' });
        }
        const players = JSON.parse(tournament.players);
        const player = players.find(player => player === uuid_player);
        if (!player) {
            request.log.warn({
                event: 'tournament-winner_attempt'
            }, 'Tournament Winner Failed: Player not found in tournament');
            return reply.code(404).send({ error: 'Player not found in this tournament' });
        }
        
        db.prepare('UPDATE tournament SET winner = ? WHERE uuid = ?').run(uuid_player, uuid);
        const info = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid);

        const response = await fetch('http://user:4000/historic', {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json',
                'x-internal-key': process.env.JWT_SECRET
            },
            body: JSON.stringify({tournament: info, game: null})
        });

        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

        request.log.info({
            event: 'tournament-winner_attempt'
        }, 'Tournament Winner Success: Winner updated');
        reply.send('Tournament updated');
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'tournament-winner_attempt'
        }, 'Tournament Winner Failed');
        reply.code(500).send({ error: 'Internal Server Error' });   
    }
});

app.patch('/tournament/launch/:uuid', async (request, reply) => {
    let uuidPlayer;
    try {
        uuidPlayer = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'tournament-launch_attempt'
        }, 'Tournament Launch Unauthorized: invalid jwt token');
        return reply.code(401).send({ error: 'Unauthorized'});
    }

    const { uuid } = request.params;

    try {
        const tournament = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid);
        if (!tournament) {
            request.log.warn({
                event: 'tournament-launch_attempt'
            }, 'Tournament Launch Failed: Tournament not found');
            return reply.code(404).send({ error: 'Tournament not found' });
        }

        if (tournament.host !== uuidPlayer) {
            request.log.warn({
                event: 'tournament-launch_attempt'
            }, 'Tournament Launch Failed: Only host can launch');
            return reply.code(403).send({ error: 'Only host can launch tournament' });
        }

        const players = JSON.parse(tournament.players);
        if (players.length !== tournament.size) {
            request.log.warn({
                event: 'tournament-launch_attempt'
            }, 'Tournament Launch Failed: Not enough players');
            return reply.code(400).send({ error: 'Not enough players' });
        }

        //? Assigner les joueurs au premier round
        const matches = JSON.parse(tournament.game);
        const firstRoundMatches = matches.filter(m => m.round === 1);
        
        for (let i = 0; i < firstRoundMatches.length; i++) {
            const player1Index = i * 2;
            const player2Index = i * 2 + 1;
            
            if (player1Index < players.length) {
                firstRoundMatches[i].player1_uuid = players[player1Index].uuid;
            }
            if (player2Index < players.length) {
                firstRoundMatches[i].player2_uuid = players[player2Index].uuid;
            }
        }

        //? Mettre à jour les matchs dans le tableau principal
        firstRoundMatches.forEach(updatedMatch => {
            const index = matches.findIndex(m => m.uuid === updatedMatch.uuid);
            if (index !== -1) {
                matches[index] = updatedMatch;
            }
        });

        //? Créer des games pour TOUS les matchs du premier round qui ont 2 joueurs
        const token = request.headers.authorization.slice(7);
        const createdGames = [];
        
        for (const match of firstRoundMatches) {
            if (match.player1_uuid && match.player2_uuid) {
                try {
                    const gameUuid = await createGameForMatch(match, uuid, token);
                    match.game_uuid = gameUuid;
                    match.status = 'ready';
                    createdGames.push({ match_uuid: match.uuid, game_uuid: gameUuid });
                    
                    const matchIndex = matches.findIndex(m => m.uuid === match.uuid);
                    if (matchIndex !== -1) {
                        matches[matchIndex] = match;
                    }
                } catch (error) {
                    console.error(`Failed to create game for match ${match.uuid}:`, error);
                }
            }
        }

        const firstMatch = firstRoundMatches[0];
        db.prepare('UPDATE tournament SET launch = ?, game = ?, current_match = ?, status = ? WHERE uuid = ?')
            .run(1, JSON.stringify(matches), firstMatch.uuid, 'in_progress', uuid);

        request.log.info({
            event: 'tournament-launch_attempt'
        }, `Tournament launched successfully with ${createdGames.length} games ready`);
        reply.send({ success: true, created_games: createdGames, matches: firstRoundMatches });
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'tournament-launch_attempt'
        }, 'Tournament Launch Failed');
        reply.code(500).send({ error: 'Internal Server Error' });   
    }
});

//? Fonction pour créer une game pour un match
async function createGameForMatch(match, tournamentUuid, token = null) {
    try {
        let player1Data, player2Data;
        
        if (token) {
            player1Data = await getUserData(match.player1_uuid, token);
            player2Data = await getUserData(match.player2_uuid, token);
        } else {
            player1Data = await getUserDataInternal(match.player1_uuid);
            player2Data = await getUserDataInternal(match.player2_uuid);
        }

        const gameData = {
            player1: player1Data?.username_tournament || 'Player 1',
            player1_uuid: match.player1_uuid,
            player2: player2Data?.username_tournament || 'Player 2',
            player2_uuid: match.player2_uuid,
            mode: 'online',
            tournament: tournamentUuid
        };

        const res = await fetch('http://game:4000/tournament-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.JWT_SECRET
            },
            body: JSON.stringify(gameData)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Failed to create game:', errorText);
            throw new Error('Failed to create game');
        }

        const { uuid: gameUuid } = await res.json();
        return gameUuid;
    } catch (error) {
        console.error('Error creating game for match:', error);
        throw error;
    }
}

//? Fonction pour récupérer les données utilisateur avec la clé interne
async function getUserDataInternal(userUuid) {
    try {
        const userResp = await fetch(`http://user:4000/user/${userUuid}`, {
            method: 'GET',
            headers: {
                'x-internal-key': process.env.JWT_SECRET
            }
        });

        if (userResp.ok) {
            const userData = await userResp.json();
            if (userData.user && userData.user.username_tournament) {
                userData.user.username = userData.user.username_tournament;
            }
            return userData.user;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching user data for ${userUuid}:`, error);
        return null;
    }
}

//? Fonction pour récupérer les données utilisateur
async function getUserData(userUuid, token) {
    try {
        const resp = await fetch(`http://user:4000/${encodeURIComponent(userUuid)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (resp.ok) {
            const data = await resp.json();
            // Privilégier username_tournament pour les tournois
            if (data.user && data.user.username_tournament) {
                data.user.username = data.user.username_tournament;
            }
            return data.user;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

//? Fonction interne pour lancer automatiquement le prochain match
async function launchNextMatchAutomatically(tournamentUuid) {
    try {
        
        const tournament = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(tournamentUuid);
        if (!tournament) {
            console.error('Tournament not found');
            return;
        }

        const matches = JSON.parse(tournament.game);
        
        const waitingMatches = matches.filter(m => m.status === 'waiting' && m.player1_uuid && m.player2_uuid);
        
        if (waitingMatches.length === 0) {
            return;
        }

        // Prendre le premier match du round le plus bas
        const currentRound = Math.min(...waitingMatches.map(m => m.round));
        const nextMatch = waitingMatches.find(m => m.round === currentRound);
        
        if (!nextMatch) {
            console.error('No match found to launch');
            return;
        }

        const player1Data = await getUserDataInternal(nextMatch.player1_uuid);
        const player2Data = await getUserDataInternal(nextMatch.player2_uuid);
        
        nextMatch.player1 = player1Data?.username_tournament || 'Player 1';
        nextMatch.player2 = player2Data?.username_tournament || 'Player 2';
        
        // Créer le game pour ce match
        const gameUuid = await createGameForMatch(nextMatch, tournamentUuid, null);
        
        if (!gameUuid) {
            console.error('Failed to create game');
            return;
        }
        
        // Marquer le match comme prêt
        nextMatch.status = 'ready';
        nextMatch.game_uuid = gameUuid;
        
        const matchIndex = matches.findIndex(m => m.uuid === nextMatch.uuid);
        matches[matchIndex] = nextMatch;

        db.prepare('UPDATE tournament SET current_match = ?, game = ? WHERE uuid = ?')
            .run(nextMatch.uuid, JSON.stringify(matches), tournamentUuid);

    } catch (error) {
        console.error('Error auto-launching next match:', error);
    }
}

//? Compléter un match (appelé automatiquement par game service)
app.patch('/tournament/:uuid/match/:match_uuid/complete', async (request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        request.log.warn({
            event: 'complete-match_attempt'
        }, 'Complete Match Unauthorized: invalid internal key');
        return reply.code(403).send({ error: 'Forbidden' });
    }

    const { uuid, match_uuid } = request.params;
    const { winner_uuid } = request.body;

    try {
        const tournament = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid);
        if (!tournament) {
            request.log.warn({
                event: 'complete-match_attempt'
            }, 'Complete Match Failed: Tournament not found');
            return reply.code(404).send({ error: 'Tournament not found' });
        }

        const matches = JSON.parse(tournament.game);
        const completedMatch = matches.find(m => m.uuid === match_uuid);
        
        if (!completedMatch) {
            console.error(`Match not found. Looking for match UUID: ${match_uuid}`);
            console.error('Available matches:', matches.map(m => ({ uuid: m.uuid, game_uuid: m.game_uuid, round: m.round })));
            request.log.warn({
                event: 'complete-match_attempt'
            }, 'Complete Match Failed: Match not found');
            return reply.code(404).send({ error: 'Match not found' });
        }

        completedMatch.status = 'completed';
        completedMatch.winner_uuid = winner_uuid;

        //? Si ce n'est pas la finale, préparer le prochain round
        if (completedMatch.next_match_index !== null && completedMatch.next_match_index < matches.length) {
            const nextMatch = matches[completedMatch.next_match_index];
            const winnerData = await getUserDataInternal(winner_uuid);
            const winnerName = winnerData?.username_tournament || 'Player';
            
            if (!nextMatch.player1_uuid) {
                nextMatch.player1_uuid = winner_uuid;
                nextMatch.player1 = winnerName;
                nextMatch.status = 'waiting';
            } else if (!nextMatch.player2_uuid) {
                nextMatch.player2_uuid = winner_uuid;
                nextMatch.player2 = winnerName;
                nextMatch.status = 'waiting';
            } else {
                console.warn(`Both player slots already filled in next match ${nextMatch.uuid}!`);
            }
        } else {
            db.prepare('UPDATE tournament SET status = ?, winner = ? WHERE uuid = ?')
                .run('completed', winner_uuid, uuid);
        }

        //? Vérifier si tous les matchs du round actuel sont terminés
        const currentRound = completedMatch.round;
        const roundMatches = matches.filter(m => m.round === currentRound);
        const allRoundComplete = roundMatches.every(m => m.status === 'completed');

        db.prepare('UPDATE tournament SET game = ? WHERE uuid = ?').run(JSON.stringify(matches), uuid);

        await launchNextMatchAutomatically(uuid);

        request.log.info({
            event: 'complete-match_attempt'
        }, 'Match completed successfully');
        reply.send({ success: true, round_completed: allRoundComplete });
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'complete-match_attempt'
        }, 'Complete Match Failed');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/tournament/:uuid/next-match/:player_uuid', async (request, reply) => {
    const { uuid, player_uuid } = request.params;
    
    try {
        await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-next-match_attempt'
        }, 'Get Next Match Unauthorized');
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    try {
        const tournament = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid);
        if (!tournament) {
            request.log.warn({
                event: 'get-next-match_attempt'
            }, 'Get Next Match Failed: Tournament not found');
            return reply.code(404).send({ error: 'Tournament not found' });
        }

        const matches = JSON.parse(tournament.game);
        const players = JSON.parse(tournament.players);
        
        if (!players.some(p => p.uuid === player_uuid)) {
            request.log.warn({
                event: 'get-next-match_attempt'
            }, 'Get Next Match Failed: Player not in tournament');
            return reply.code(403).send({ error: 'Player not in tournament' });
        }

        for (const match of matches.sort((a, b) => a.round - b.round)) {
            if (match.player1_uuid === player_uuid || match.player2_uuid === player_uuid) {
                if (match.game_uuid) {
                    try {
                        const gameResp = await fetch(`http://game:4000/game/${match.game_uuid}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': request.headers.authorization
                            }
                        });
                        
                        if (gameResp.ok) {
                            const gameData = await gameResp.json();
                            if (!gameData.winner) {
                                request.log.info({
                                    event: 'get-next-match_attempt'
                                }, 'Get Next Match Success: Ready/Playing match found for player');
                                return reply.send({
                                    match: {
                                        ...match,
                                        ...gameData,
                                        uuid: match.uuid,
                                        round: match.round,
                                        status: match.status,
                                        game_uuid: match.game_uuid
                                    }
                                });
                            }
                        }
                    } catch (e) {
                        console.error(`Error fetching game ${match.game_uuid}:`, e);
                    }
                }
                else if (match.status === 'waiting' && match.player1_uuid && match.player2_uuid) {
                    request.log.info({
                        event: 'get-next-match_attempt'
                    }, 'Get Next Match Success: Waiting match found for player');
                    return reply.send({
                        match: {
                            uuid: match.uuid,
                            player1: match.player1,
                            player1_uuid: match.player1_uuid,
                            player2: match.player2,
                            player2_uuid: match.player2_uuid,
                            round: match.round,
                            status: match.status,
                            game_uuid: null
                        }
                    });
                }
            }
        }

        request.log.info({
            event: 'get-next-match_attempt'
        }, 'Get Next Match Success: No match available');
        return reply.send({ match: null, message: 'No match available' });
    } catch (err) {
        request.log.error({
            error: { message: err.message, code: err.code },
            event: 'get-next-match_attempt'
        }, 'Get Next Match Failed');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/tournament/:uuid/status', async (request, reply) => {
    const { uuid } = request.params;
    
    try {
        await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-tournament-status_attempt'
        }, 'Get Tournament Status Unauthorized');
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    try {
        const tournament = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid);
        if (!tournament) {
            request.log.warn({
                event: 'get-tournament-status_attempt'
            }, 'Get Tournament Status Failed: Tournament not found');
            return reply.code(404).send({ error: 'Tournament not found' });
        }

        const matches = JSON.parse(tournament.game);
        const matchesStatus = [];

        // Récupérer l'état de chaque match qui a un game
        for (const match of matches) {
            if (!match.game_uuid) {
                // Match pas encore créé - enrichir avec les noms des joueurs
                const matchData = {
                    uuid: match.uuid,
                    round: match.round,
                    status: match.status || 'waiting',
                    player1_uuid: match.player1_uuid,
                    player2_uuid: match.player2_uuid,
                    player1: match.player1 || null,
                    player2: match.player2 || null,
                    winner_uuid: match.winner_uuid
                };
                
                // 🔧 CORRECTION: Enrichir avec les noms des joueurs si pas déjà présents
                try {
                    if (match.player1_uuid && !match.player1) {
                        const player1Data = await getUserDataInternal(match.player1_uuid);
                        matchData.player1 = player1Data?.username_tournament || 'Player 1';
                    }
                    if (match.player2_uuid && !match.player2) {
                        const player2Data = await getUserDataInternal(match.player2_uuid);
                        matchData.player2 = player2Data?.username_tournament || 'Player 2';
                    }
                    if (match.winner_uuid) {
                        const winnerData = await getUserDataInternal(match.winner_uuid);
                        matchData.winner = winnerData?.username_tournament || 'Winner';
                    }
                } catch (e) {
                    console.error('Error enriching match data:', e);
                }
                
                matchesStatus.push(matchData);
                continue;
            }

            try {
                const gameResp = await fetch(`http://game:4000/game/${match.game_uuid}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': request.headers.authorization
                    }
                });
                
                if (gameResp.ok) {
                    const gameData = await gameResp.json();
                    matchesStatus.push({
                        ...gameData,
                        round: match.round,
                        status: gameData.winner ? 'completed' : 
                               (gameData.player1 && gameData.player2) ? match.status : 'waiting'
                    });
                }
            } catch (e) {
                console.error(`Error fetching match game ${match.game_uuid}:`, e);
                matchesStatus.push({
                    uuid: match.uuid,
                    round: match.round,
                    status: 'error',
                    error: 'Failed to fetch game data'
                });
            }
        }

        // Organiser par rounds
        const rounds = {};
        matchesStatus.forEach(match => {
            if (!rounds[match.round]) {
                rounds[match.round] = [];
            }
            rounds[match.round].push(match);
        });

        request.log.info({
            event: 'get-tournament-status_attempt'
        }, 'Get Tournament Status Success');
        return reply.send({
            tournament: {
                uuid: tournament.uuid,
                name: tournament.name,
                host: tournament.host,
                size: tournament.size,
                winner: tournament.winner,
                launch: tournament.launch,
                status: tournament.status
            },
            rounds,
            totalRounds: Object.keys(rounds).length,
            currentRound: Math.min(...Object.keys(rounds).map(r => parseInt(r)).filter(r => {
                return rounds[r].some(m => m.status !== 'completed');
            })) || Object.keys(rounds).length
        });
    } catch (err) {
        request.log.error({
            error: { message: err.message, code: err.code },
            event: 'get-tournament-status_attempt'
        }, 'Get Tournament Status Failed');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

async function createGame (player1_uuid = null, player2_uuid = null, tournament = null, token ){
    const infoplay = {
        player1_uuid,
        player2_uuid,
        tournament,
        mode: 'online'
    };

    const res = await fetch('http://game:4000/game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(infoplay)
    });

    if (!res.ok)
        throw new Error('Failed to create game');

    // deconstruction d'objet, equivalent a ca:
    // const data = await res.json();
    // const uuid = data.uuid;
    const { uuid } = await res.json();
    return uuid;
}

app.delete('/delete-tournament', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        request.log.warn({
            event: 'delete-tournament'
        }, 'Delete Tournament Unauthorized: invalid jwt token');
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const { uuid } = request.body;

    try {
        await db.prepare('DELETE FROM tournament WHERE host = ?').run(uuid);
        request.log.info({
            event: 'delete-tournament_attempt',
            }, 'Delete Tournament Sucess: Delete for host');
        return reply.send({ success: true });
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'delete-tournament'
        }, 'Delete Tournament failed with error');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
})

// Middleware pour vérifier le JWT et récupérer le uuid
async function checkToken(request) {
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7); // slice coupe le nombre de caractere donne
    const payload = await request.jwtVerify(); // methode de fastify-jwt pour verifier le token
    return payload.uuid;
}

app.listen({ port: 4000, host: '0.0.0.0' })

export default app;
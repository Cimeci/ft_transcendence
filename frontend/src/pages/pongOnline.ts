import { navigateTo } from '../routes';
import { CreateWrappedButton } from "../components/utils";
import { getUser } from "../linkUser";
import { t } from "./settings";
import type { Friend } from "./friends";
import { getUserInventory } from './inventory';

export const gameHistory: string[] = [];

interface GAME {
	uuid: string,
	host_player: string,
	invited_player:string,
}

export function PongOnlineMenuPage(): HTMLElement {
	//! CREATE GAME
	// const game: GAME = {
		
	// }

	const mainContainer = document.createElement("div");
	mainContainer.className = "p-10 pt-25 min-h-screen w-full flex flex-col xl:flex-row items-center justify-center gap-10 bg-linear-to-bl from-black via-green-900 to-black"

	const rightContainer = document.createElement("div");{
	rightContainer.className = "z-[200] p-2 fixed top-25 right-0 h-full min-w-3/20 glass-blur flex flex-col gap-3 justify-between items-center";
	rightContainer.classList.add("hidden");
	mainContainer.appendChild(rightContainer);

	const btnRightBar = document.createElement("button");
	btnRightBar.className = "top-25 right-5 w-10 h-10 fixed z-[2000] cursor-pointer duration-200 transition-all hover:-translate-x-2";
	btnRightBar.onclick = () => {
		if (rightContainer.classList.contains("hidden")) {
			btnRightBar.classList.remove("right-5", "hover:-translate-x-2");
			btnRightBar.classList.add("right-[calc(15%+1.25rem)]", "hover:translate-x-2");
			rightContainer.classList.remove("hidden");
		} else {
			btnRightBar.classList.remove("right-[calc(15%+1.25rem)]");
			btnRightBar.classList.add("right-5", "hover:-translate-x-2");
			btnRightBar.classList.remove("right-3/10", "hover:translate-x-2");
			rightContainer.classList.add("hidden");
		}
	}
	mainContainer.appendChild(btnRightBar);

	const iconRightBar = document.createElement("img");
	iconRightBar.className = "w-full h-full"
	iconRightBar.src = "/icons/contact.svg"
	btnRightBar.appendChild(iconRightBar);

	const lstFriends = document.createElement("ul");
	lstFriends.className = "glass-blur w-9/10 h-9/10 overflow-y-auto divide-y";
	rightContainer.appendChild(lstFriends);


	let friendData: Friend[] = [];

	const token = localStorage.getItem("jwt") || "";
	(async () => {
	  	try {
	  	  	const resp = await fetch("/user/friendship", { headers: { Authorization: `Bearer ${token}` } });
	  	  	if (!resp.ok) throw new Error(String(resp.status));

	  	  	const data = await resp.json();
	  	  	const me = getUser()?.uuid;
			const rows = (data?.friendship ?? []) as Array<{ user_id: string; friend_id: string }>;

			console.log("Data", data);
			console.log("Rows", rows);
			const list = await Promise.all(rows.map(async (r) => {
	  	  	  	const other = r.user_id === me ? r.friend_id : r.user_id;
	  	  	  	try {
	  	  	  	  	const r2 = await fetch(`/user/${encodeURIComponent(other)}`, {
	  	  	  	  	  	headers: { Authorization: `Bearer ${token}` }
	  	  	  	  	});
	  	  	  	  	if (r2.ok) {
	  	  	  	  	  	const { user } = await r2.json();
						console.log("USER", user);
	  	  	  	  	  	return {
	  	  	  	  	  	  	id: other,
	  	  	  	  	  	  	username: user.username || other,
	  	  	  	  	  	  	invitation: t.friends,
	  	  	  	  	  	  	avatar: user.avatar_use[0].id || "/avatar/default_avatar.png",
							ball: user.ball_use[0].id || "/ball/default_ball.png",
							bar: user.paddle_use[0].id || "/playbar/default_bar.png",
	  	  	  	  	  	};
	  	  	  	  	}
	  	  	  	} catch {}
	  	  	  	return { id: other, username: other, invitation: t.friends, avatar: "/avatar/default_avatar.png",
					ball: "/ball/default_ball.png", bar: "/playbar/default_bar.png" };
	  	  	}));
	  	  	friendData = list;
	  	} catch (e) {
	  	  	console.error("load friendship failed", e);
	  	  	friendData = [];
	  	}

		console.log("FRIEND_DATA", friendData);

		friendData.forEach(e => {
			console.log("EACH USER: ", e);
			const li: HTMLLIElement = document.createElement("li");
			li.className = "flex justify-between items-center p-2 w-full min-h-12"
		
			const profil = document.createElement("div");{
			profil.className = "flex gap-2 justify-center items-center";
			li.appendChild(profil);
			
			const icon = document.createElement("img");
			icon.src = e.avatar;
			icon.className = "w-8 h-8 rounded-full object-cover";
			profil.appendChild(icon);
			
			const name = document.createElement("p");
			name.className = "text-base";
			name.textContent = e.username;
			profil.appendChild(name);
			}
		
			const btn = document.createElement("button");
			btn.className = "inline-flex px-3 py-1.5 rounded-lg duration-300 transition-all hover:scale-105 bg-green-500 hover:bg-green-600";
			btn.textContent = t.invite;
			btn.addEventListener("click", async () => {
				//! INVITE FRIEND TO ONLINE GAME
				// console.log("BODY INVITATION: ", e?.uuid, " |", e.id);
			
				// if (!e?.uuid) {
				// 	console.error("No tournament UUID");
				// 	btn.textContent = t.error;
				// 	return;
				// }
			
				// btn.textContent = "...";
				// btn.disabled = true;
			
				// try {
				// 	const check = await Invitation(e.uuid, e.id, "tournament");
				
				// 	if (check === true) {
				// 		btn.textContent = t.requests_send;
				// 		btn.disabled = true;
				// 		btn.style.backgroundColor = "#00ff08ff";
				// 	} else {
				// 		btn.textContent = t.error;
				// 		btn.disabled = false;
				// 		// Réinitialiser après 2 secondes
				// 		setTimeout(() => {
				// 			btn.textContent = t.invite;
				// 			btn.disabled = false;
				// 		}, 2000);
				// 	}
				// } catch (error) {
				// 	console.error("Invitation error:", error);
				// 	btn.textContent = t.error;
				// 	btn.disabled = false;
				// 	// Réinitialiser après 2 secondes
				// 	setTimeout(() => {
				// 		btn.textContent = t.invite;
				// 		btn.disabled = false;
				// 	}, 2000);
				// }
			});
			li.appendChild(btn);
			lstFriends.appendChild(li);
		});
	})();
	}

	const TitlePong = document.createElement("h1");
	TitlePong.className = "pt-25 text-6xl sm:text-8xl tracking-widest absolute top-0 text-green-400 neon-matrix w-full text-center";
	TitlePong.textContent = t.online;
	mainContainer.appendChild(TitlePong);

	const container1 = document.createElement("div");
	container1.className = "mt-30 xl:mt-15 p-10 w-9/10 xl:w-1/3 h-[55vh] flex flex-col gap-10 glass-blur justify-around items-center text-center";
	mainContainer.appendChild(container1);

	const username = document.createElement("p");
	username.className = "w-9/10 glass-blur text-xl py-1";
	username.textContent = getUser()?.username || "default";
	container1.appendChild(username);

	const inventory = document.createElement("div");
	inventory.className = "w-9/10 flex justify-around";
	container1.appendChild(inventory);

	const barContainer = document.createElement("div");
		barContainer.className = "glass-blur h-[11rem] w-[11rem] p-1";
		inventory.appendChild(barContainer);
		
		const bar = document.createElement("img");
		bar.src = "/playbar/default_bar.png";
		bar.className = "m-auto h-full rounded-xl";
		barContainer.appendChild(bar);


	const container2 = document.createElement("div");
	container2.className = "mt-15 p-5 w-9/10 xl:w-2/3 h-[60vh] flex flex-col gap-4 glass-blur justify-around items-center text-center";
	mainContainer.appendChild(container2);

	const playBtn = CreateWrappedButton(mainContainer, t.play, "null", 5);
	playBtn.onclick = () => {
		if (user2.name) navigateTo("/pong/online/game");
		else
		{
			username.classList.add("placeholder-red-700", "shake");
			setTimeout(() => {username.classList.remove("placeholder-red-700", "shake")}, 700)
		}
	}
	container2.appendChild(playBtn);

	const GlobalValue = document.createElement("div");
	GlobalValue.className = "w-full flex justify-around"
	container2.appendChild(GlobalValue);

	const bgContainer = document.createElement("div");
		bgContainer.className = "glass-blur h-[16rem] w-[16rem] flex flex-col gap-2 p-1";
		GlobalValue.appendChild(bgContainer);
		
		const bgTxt = document.createElement("p");
		bgTxt.textContent = t.gamebackground;
		bgContainer.appendChild(bgTxt);

		const bg = document.createElement("img");
		bg.src = "/bg/default_bg.gif";
		bg.className = "m-auto w-full rounded-xl";
		bgContainer.appendChild(bg);

	const ballContainer = document.createElement("div");
		ballContainer.className = "glass-blur h-[16rem] w-[16rem] flex flex-col gap-2 p-1";
		GlobalValue.appendChild(ballContainer);
		
		const ballTxt = document.createElement("p");
		ballTxt.textContent = t.ball;
		ballContainer.appendChild(ballTxt);

		const ball = document.createElement("img");
		ball.src = "/ball/default_ball.gif";
		ball.className = "m-auto w-8/10 rounded-xl";
		ballContainer.appendChild(ball);

	
	const backBtn = CreateWrappedButton(mainContainer, t.back, "/pong/menu", 0);
	container2.appendChild(backBtn);



	const container3 = document.createElement("div");
	container3.className = "mt-15 p-10 w-9/10 xl:w-1/3 h-[55vh] flex flex-col gap-10 glass-blur justify-around items-center text-center";
	mainContainer.appendChild(container3);

	const username2 = document.createElement("p");
	username2.className = "w-9/10 glass-blur text-xl py-1";
	username2.textContent = "USER NAME OPPONENT"; //! USER NAME OPPONENT
	container3.appendChild(username2);

	const inventory2 = document.createElement("div");
	inventory2.className = "w-9/10 flex justify-around";
	container3.appendChild(inventory2);

	const barContainer2 = document.createElement("div");
		barContainer2.className = "glass-blur h-[11rem] w-[11rem] p-1";
		inventory2.appendChild(barContainer2);
		
		const bar2 = document.createElement("img");
		bar2.src = "/playbar/default_bar.png";
		bar2.className = "m-auto h-full rounded-xl";
		barContainer2.appendChild(bar2);

	async function setInventory() {
		const userInventory = await getUserInventory();

		ball.src = userInventory?.ball_use[0].id || "/ball/default_ball.png";
		bar.src = userInventory?.paddle_use[0].id || "/playbar/default_bar.png";
		bg.src = userInventory?.background_use[0].id || "/bg/default_bg.png";
	}
	setInventory();

	return (mainContainer);
}

export interface User {
	name: string;
	score: number;
}

export const user1: User = {
	name: "user1",
	score: 0,
};

export const user2: User = {
	name: "user2",
	score: 0,
};

export function PongOnlineOverlayPage(): HTMLElement {
	const overlay = document.createElement("div");
	overlay.className = "gap-30 z-2000 h-full min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-t from-green-500 via-black to-green-800";
	overlay.focus();
	
	const winner = (user1.score === 5) ? user1.name : user2.name;
	const loser = (user1.score === 5) ? user2.name : user1.name;
	const scoreStr = `${user1.name} (${user1.score}) vs ${user2.name} (${user2.score})`;

	gameHistory.unshift(`${t.winner} ${winner} vs ${loser} (${user1.score}-${user2.score})`);
	if (gameHistory.length > 10) gameHistory.pop();

	const result = document.createElement("h1");
	result.className = "text-8xl text-green-400 mb-8";
	result.textContent = `${t.winner} ${winner}`;
	overlay.appendChild(result);

	const scoreResult = document.createElement("h1");
	scoreResult.className = "text-6xl text-green-400 mb-8";
	scoreResult.textContent = scoreStr;
	overlay.appendChild(scoreResult);

	const BackContainer = document.createElement("div");
	BackContainer.className = "flex flex-col justify-center items-center gap-4 text-center";

	const BackBtnWrapper = document.createElement("div");
	BackBtnWrapper.className = "relative inline-flex items-center justify-center animated-gradient-border rounded-full p-[clamp(2px,0.6vw,8px)] mb-2 w-fit h-fit";

	const BackBtn = document.createElement("button");
	BackBtn.className = "relative z-10 inline-flex items-center justify-center whitespace-nowrap leading-none w-fit h-fit cursor-pointer transition-all duration-300 hover:scale-98 text-7xl tracking-widest text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none";
	BackBtn.textContent = t.back_to_menu;
	BackBtn.tabIndex = 0;

	BackBtn.addEventListener('click', () => {
		overlay.classList.add("fade-out");
		setTimeout(() => {
			user1.score = 0;
			user2.score = 0;
			navigateTo("/pong/menu");
		}, 1000);
	});

	BackBtnWrapper.appendChild(BackBtn);
	BackContainer.appendChild(BackBtnWrapper);
	overlay.appendChild(BackContainer);

	return overlay;
}

function OnlinePong(score1Elem: HTMLElement, score2Elem: HTMLElement): HTMLElement {
	let socket = new WebSocket(`wss://${window.location.host}/websocket`);
	let myPosition: 'left' | 'right' | null = null;
	
	socket.onopen = () => {
		console.log('[WS] open', socket.url);
		send({ event: 'join', username: getUser()?.username, avatar: getUser()?.avatar });
	};
	socket.onerror = (e) => console.error('[WS] error', e);
	socket.onclose = (ev) => console.warn('[WS] close', ev.code, ev.reason, ev.wasClean);

	type ServerState = {
		ball: { x: number; y: number; radius: number };
		paddles: { leftY: number; rightY: number };
		scores: { left: number; right: number };
		state?: 'waiting' | 'playing' | 'game_over';
		winner?: 'left' | 'right';
	};

	const container = document.createElement("div");
	container.className = "relative flex flex-col items-center justify-center";

	function send(data: any) {
	  	if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data));
	}

	type Dir = 'idle'|'up'|'down';
	const pressedKeys = new Set<string>();
	const input = { left: 'idle' as Dir, right: 'idle' as Dir };
	const TICK_MS = 20;
	let sendTimer: number | null = null;

	function startSendLoop() {
		if (sendTimer != null) return;
		sendTimer = window.setInterval(() => {
			if (myPosition === 'left' && input.left !== 'idle') {
				send({ event: 'move', paddle: 'left', direction: input.left });
			}
			if (myPosition === 'right' && input.right !== 'idle') {
				send({ event: 'move', paddle: 'right', direction: input.right });
			}
		}, TICK_MS);
	}

	function stopSendLoopIfIdle() {
		if (input.left === 'idle' && input.right === 'idle' && sendTimer != null) {
			window.clearInterval(sendTimer);
			sendTimer = null;
		}
	}

	function recomputeFromPressed() {
		if (!myPosition) return;

		const prevLeft = input.left, prevRight = input.right;
		
		// Chaque joueur ne contrôle que sa propre paddle
		if (myPosition === 'left') {
			input.left = pressedKeys.has('w') ? 'up' : (pressedKeys.has('s') ? 'down' : 'idle');
			input.right = 'idle'; // Le joueur gauche ne contrôle pas la droite
		} else if (myPosition === 'right') {
			input.left = 'idle'; // Le joueur droite ne contrôle pas la gauche
			input.right = pressedKeys.has('ArrowUp') ? 'up' : (pressedKeys.has('ArrowDown') ? 'down' : 'idle');
		}

		// Envoyer les commandes stop seulement pour sa propre paddle
		if (myPosition === 'left' && prevLeft !== input.left && input.left === 'idle') {
			send({ event: 'stop', paddle: 'left' });
		}
		if (myPosition === 'right' && prevRight !== input.right && input.right === 'idle') {
			send({ event: 'stop', paddle: 'right' });
		}

		if ((myPosition === 'left' && input.left !== 'idle') || 
			(myPosition === 'right' && input.right !== 'idle')) {
			startSendLoop();
		} else {
			stopSendLoopIfIdle();
		}
	}

	const onKeyDown = (e: KeyboardEvent) => {
		if (!myPosition) return;

		// Joueur gauche : seulement W/S
		if (myPosition === 'left' && (e.key === 'w' || e.key === 's')) {
			pressedKeys.add(e.key);
			recomputeFromPressed();
			e.preventDefault();
		} 
		// Joueur droite : seulement flèches
		else if (myPosition === 'right' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
			pressedKeys.add(e.key);
			recomputeFromPressed();
			e.preventDefault();
		} 
		// Boost disponible pour les deux joueurs
		else if (e.key === 'e') {
			send({ event: 'boost' });
		}
	};

	const onKeyUp = (e: KeyboardEvent) => {
		if (!myPosition) return;

		if ((myPosition === 'left' && (e.key === 'w' || e.key === 's')) ||
			(myPosition === 'right' && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))) {
			pressedKeys.delete(e.key);
			recomputeFromPressed();
			e.preventDefault();
		}
	};

	window.addEventListener('keydown', onKeyDown);
	window.addEventListener('keyup', onKeyUp);
	window.addEventListener('blur', () => {
		pressedKeys.clear();
		input.left = input.right = 'idle';
		stopSendLoopIfIdle();
		if (myPosition === 'left') {
			send({ event: 'stop', paddle: 'left' });
		} else if (myPosition === 'right') {
			send({ event: 'stop', paddle: 'right' });
		}
	});

	function cleanup() {
		window.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('keyup', onKeyUp);
		if (sendTimer != null) { 
			window.clearInterval(sendTimer); 
			sendTimer = null; 
		}
		try { 
			socket.close(); 
		} catch {}
	}

	const resolveBallPath = () => {
		const raw = '/bar/default_ball.png';
		return raw.startsWith('/') ? raw : '/' + raw;
	};
	let currentBallSrc = resolveBallPath();

	const ballImg = new Image();
	ballImg.src = currentBallSrc;

	let ballImgLoaded = false;
	ballImg.onload = () => { ballImgLoaded = true; };

	const resolveBarPath = () => {
		const raw = '/bar/default_bar.png';
		return raw.startsWith('/') ? raw : '/' + raw;
	};
	let currentBarSrc = resolveBarPath();

	const leftBarImg = new Image();
	leftBarImg.src = currentBarSrc;	

	let leftBarImgLoaded = false;
	leftBarImg.onload = () => { leftBarImgLoaded = true; };

	const resolveRightBarPath = () => {
		const raw = '/bar/default_bar.png';
		return raw.startsWith('/') ? raw : '/' + raw;
	};
	let currentRightBarSrc = resolveRightBarPath();

	const rightBarImg = new Image();
	rightBarImg.src = currentRightBarSrc;

	let rightBarImgLoaded = false;
	rightBarImg.onload = () => { rightBarImgLoaded = true; };

	const canvas = document.createElement("canvas");
	canvas.width = 1400;
	canvas.height = 800;

	const bgUrl = '/bg/default_bar.png';
	canvas.className = "border-2 w-[70vw] h-[80vh]";
	canvas.style.backgroundImage = `url('${bgUrl}')`;
	canvas.style.backgroundSize = "cover";
	canvas.style.backgroundPosition = "center";
	canvas.style.backgroundRepeat = "no-repeat";
	container.appendChild(canvas);

	const ctx = canvas.getContext("2d")!;
	const paddleWidth = 10;
	const paddleHeight = 120;

  	let state: ServerState | null = null;

  	socket.onmessage = (ev) => {
		try {
			const msg = JSON.parse(ev.data);
			
			// Recevoir la position assignée
			if (msg.event === 'assigned') {
				myPosition = msg.position;
				console.log(`Position assignée: ${myPosition}`);
				
				// Mettre à jour les noms des joueurs selon la position
				if (myPosition === 'left') {
					user1.name = getUser()?.username || "Joueur 1";
					user2.name = "En attente...";
				} else if (myPosition === 'right') {
					user2.name = getUser()?.username || "Joueur 2";
				}
				
				score1Elem.textContent = `${user1.name}: ${user1.score}`;
				score2Elem.textContent = `${user2.name}: ${user2.score}`;
			}
			
			// Recevoir l'état du jeu
			if (msg.ball && msg.leftPaddle && msg.rightPaddle) {
				state = {
		  			ball: msg.ball,
		  			paddles: { 
						leftY: msg.leftPaddle.y ?? 340, 
						rightY: msg.rightPaddle.y ?? 340 
					},
		  			scores: { 
						left: msg.score?.left ?? 0, 
						right: msg.score?.right ?? 0 
					},
		  			state: msg.event === 'finish' ? 'game_over' : 'playing',
		  			winner: msg.winner
		  		};

				if (state?.scores) {
					user1.score = state.scores.left ?? 0;
					user2.score = state.scores.right ?? 0;
					score1Elem.textContent = `${user1.name}: ${user1.score}`;
					score2Elem.textContent = `${user2.name}: ${user2.score}`;
				}

				// Mettre à jour le nom de l'adversaire si on le connaît
				if (msg.opponentUsername && myPosition) {
					if (myPosition === 'left') {
						user2.name = msg.opponentUsername;
					} else if (myPosition === 'right') {
						user1.name = msg.opponentUsername;
					}
					score1Elem.textContent = `${user1.name}: ${user1.score}`;
					score2Elem.textContent = `${user2.name}: ${user2.score}`;
				}
			}

			if (state?.state === 'game_over') {
				cleanup();
				setTimeout(() => {
					navigateTo("/pong/online/game/overlay");
				}, 2000);
			}
		} catch (e) {
			console.error('Error parsing WebSocket message:', e);
		}
	};

	socket.onclose = () => {
		if (state?.state !== 'game_over') {
			cleanup();
			// Rediriger vers le menu si la connexion est perdue
			setTimeout(() => {
				navigateTo("/pong/online/menu");
			}, 1000);
		}
	};

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const latestBar = resolveBarPath();
		if (latestBar !== currentBarSrc) {
			currentBarSrc = latestBar;
			leftBarImgLoaded = false;
			leftBarImg.src = currentBarSrc;
		}
		const latestRightBar = resolveRightBarPath();
		if (latestRightBar !== currentRightBarSrc) {
			currentRightBarSrc = latestRightBar;
			rightBarImgLoaded = false;
			rightBarImg.src = currentRightBarSrc;
		}
		const latestBall = resolveBallPath();
		if (latestBall !== currentBallSrc) {
			currentBallSrc = latestBall;
			ballImgLoaded = false;
			ballImg.src = currentBallSrc;
		}

		if (!state) {
			ctx.fillStyle = "white";
			ctx.font = "24px system-ui";
			ctx.textAlign = "center";
			
			if (!myPosition) {
				ctx.fillText("En attente d'un adversaire...", canvas.width/2, canvas.height/2);
				ctx.fillText("Position: " + (myPosition || "Non assignée"), canvas.width/2, canvas.height/2 + 40);
			} else {
				ctx.fillText(`Vous êtes le joueur ${myPosition === 'left' ? 'gauche' : 'droit'}`, canvas.width/2, canvas.height/2);
				ctx.fillText("En attente du début de la partie...", canvas.width/2, canvas.height/2 + 40);
			}
			return;
		}

		const leftY = state.paddles?.leftY ?? canvas.height/2 - paddleHeight/2;
		const rightY = state.paddles?.rightY ?? canvas.height/2 - paddleHeight/2;

		// Dessiner la paddle gauche
		if (leftBarImgLoaded) {
			ctx.drawImage(leftBarImg, 10, leftY, paddleWidth, paddleHeight);
		} else {
			ctx.fillStyle = myPosition === 'left' ? "#00ff00" : "white";
			ctx.fillRect(10, leftY, paddleWidth, paddleHeight);
		}

		// Dessiner la paddle droite
		if (rightBarImgLoaded) {
			ctx.drawImage(rightBarImg, canvas.width - 20, rightY, paddleWidth, paddleHeight);
		} else {
			ctx.fillStyle = myPosition === 'right' ? "#00ff00" : "white";
			ctx.fillRect(canvas.width - 20, rightY, paddleWidth, paddleHeight);
		}

		// Dessiner la balle
		const bx = state.ball?.x ?? canvas.width/2;
		const by = state.ball?.y ?? canvas.height/2;
		const br = state.ball?.radius ?? 20;

		if (ballImgLoaded) {
			ctx.drawImage(ballImg, bx - br, by - br, br * 2, br * 2);
		} else {
			ctx.fillStyle = "rgba(255,255,255,0.8)";
			ctx.beginPath();
			ctx.arc(bx, by, br, 0, Math.PI * 2);
			ctx.fill();
		}

		// Afficher les contrôles selon la position
		ctx.fillStyle = "white";
		ctx.font = "16px system-ui";
		ctx.textAlign = "left";
		
		if (myPosition === 'left') {
			ctx.fillText("Contrôles: W (haut) / S (bas)", 20, 30);
		} else if (myPosition === 'right') {
			ctx.fillText("Contrôles: ↑ (haut) / ↓ (bas)", canvas.width - 200, 30);
		}
	}

	function loop() {
		draw();
		requestAnimationFrame(loop);
	}

	loop();
	return container;
}

export function PongOnlineGamePage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "gap-2 z-2000 h-full min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-t from-green-500 via-black to-green-800"

	mainContainer.innerHTML = "";

	const TitlePong = document.createElement("h1");
	TitlePong.className = "absolute top-0 text-8xl tracking-widest text-green-400 neon-matrix w-full text-center";
	TitlePong.textContent = "P O N G";
	mainContainer.appendChild(TitlePong);

	const ScorePong = document.createElement("div");
	ScorePong.className = "w-[69vw] h-[100px] flex justify-between";

	const Profile1 = document.createElement("div");
	Profile1.className = "flex items-end gap-3"

	const Avatar1 = document.createElement("img");
	Avatar1.src = "/avatar/default_avatar.png";
	Avatar1.className = "border-1 size-15 rounded-lg";
	Profile1.appendChild(Avatar1);

	const Score1 = document.createElement("h1");
	Score1.className = "text-3xl tracking-widest text-green-400 neon-matrix";
	Score1.textContent = user1.name + ": " + user1.score
	Profile1.appendChild(Score1);

	const Profile2 = document.createElement("div");
	Profile2.className = "flex items-end gap-3"

	const Avatar2 = document.createElement("img");
	Avatar2.src = "/public/avatar/default_avatar.png";
	Avatar2.className = "border-1 size-15 rounded-lg";
	Profile2.appendChild(Avatar2);

	const Score2 = document.createElement("h1");
	Score2.className = "text-3xl tracking-widest text-green-400 neon-matrix";
	Score2.textContent = user2.name + ": " + user2.score
	Profile2.appendChild(Score2);

	ScorePong.appendChild(Profile1);
	ScorePong.appendChild(Profile2);

	mainContainer.appendChild(ScorePong);

	const canvas = OnlinePong(Score1, Score2);
	mainContainer.appendChild(canvas);

	return mainContainer;
}
import { getCurrentLang } from "./settings";
import { translations } from '../i18n';
import { navigateTo } from '../routes';
import { CreateWrappedButton } from "../components/utils";
import { getUser } from "../linkUser";
import { t } from "./settings";
import type { Friend } from "./friends";

export const gameHistory: string[] = [];

export function PongOnlineMenuPage(): HTMLElement {
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
	lstFriends.className = "glass-blur w-9/10 h-full overflow-y-auto divide-y";
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

			const list = await Promise.all(rows.map(async (r) => {
	  	  	  	const other = r.user_id === me ? r.friend_id : r.user_id;
	  	  	  	try {
	  	  	  	  	const r2 = await fetch(`/user/${encodeURIComponent(other)}`, {
	  	  	  	  	  	headers: { Authorization: `Bearer ${token}` }
	  	  	  	  	});
	  	  	  	  	if (r2.ok) {
	  	  	  	  	  	const { user } = await r2.json();
	  	  	  	  	  	return {
	  	  	  	  	  	  	id: other,
	  	  	  	  	  	  	username: user.username || other,
	  	  	  	  	  	  	invitation: "Friend",
	  	  	  	  	  	  	avatar: user.avatar || "/avatar/default_avatar.png"
	  	  	  	  	  	};
	  	  	  	  	}
	  	  	  	} catch {}
	  	  	  	return { id: other, username: other, invitation: "Friend", avatar: "/avatar/default_avatar.png" };
	  	  	}));
	  	  	friendData = list;
	  	} catch (e) {
	  	  	console.error("load friendship failed", e);
	  	  	friendData = [];
	  	}
	})();

	friendData.forEach(e => {
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
		btn.addEventListener("click", () => {
			window.showInvite({
				username: e.username || "default",
				id: e.id.split("-")[0] || t.err_id,
				avatar: e.avatar || "/avatar/default_avatar.png",
				message: "Invitation to play against " + getUser()?.username || "default",
			});
		});
		li.appendChild(btn);
		lstFriends.appendChild(li);
	});
	}

	const TitlePong = document.createElement("h1");
	TitlePong.className = "pt-25 text-6xl sm:text-8xl tracking-widest absolute top-0 text-green-400 neon-matrix w-full text-center";
	TitlePong.textContent = t.online;
	mainContainer.appendChild(TitlePong);

	const container1 = document.createElement("div");{
	container1.className = "mt-30 xl:mt-15 p-10 w-9/10 xl:w-1/3 h-[55vh] flex flex-col gap-10 glass-blur justify-around items-center text-center";
	mainContainer.appendChild(container1);

	const username = document.createElement("p");
	username.className = "w-9/10 glass-blur text-xl py-1";
	username.textContent = getUser()?.username || "default";
	container1.appendChild(username);

	// onUserChange(u => { username.textContent = u?.username || "default"; });

	const inventory = document.createElement("div");
	inventory.className = "w-9/10 flex justify-around";
	container1.appendChild(inventory);

	const ballContainer = document.createElement("div");{
		ballContainer.className = "glass-blur h-[11rem] w-[11rem] p-1";
		inventory.appendChild(ballContainer);

		const ball = document.createElement("img");
		ball.src = "/ball/default_ball.png";
		ball.className = "w-full h-full rounded-xl";
		ballContainer.appendChild(ball);
	}

	const barContainer = document.createElement("div");{
		barContainer.className = "glass-blur h-[11rem] w-[11rem] p-1";
		inventory.appendChild(barContainer);
		
		const bar = document.createElement("img");
		bar.src = "/bar/default_bar.png";
		bar.className = "w-full h-full rounded-xl";
		barContainer.appendChild(bar);
	}
	}

	const container2 = document.createElement("div");{
	container2.className = "mt-15 p-10 w-9/10 xl:w-1/3 h-[55vh] flex flex-col gap-6 glass-blur justify-around items-center text-center";
	mainContainer.appendChild(container2);

	const playBtn = CreateWrappedButton(mainContainer, t.play, "/pong/online/game", 5);
	// playBtn.className += "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl";
	container2.appendChild(playBtn);

	const bgContainer = document.createElement("div");{
		bgContainer.className = "glass-blur h-[14rem] w-[14rem] flex flex-col gap-2 p-1";
		container2.appendChild(bgContainer);
		
		const bgTxt = document.createElement("p");
		bgTxt.textContent = t.gamebackground || "Background";
		bgContainer.appendChild(bgTxt);

		const bg = document.createElement("img");
		bg.src = "/bg/matrix_bg.gif";
		bg.className = "w-full rounded-xl h-full";
		bgContainer.appendChild(bg);
	}

	const backBtn = CreateWrappedButton(mainContainer, t.back, "/pong/menu", 0);
	container2.appendChild(backBtn);

	}

	const container3 = document.createElement("div");{
	container3.className = "mt-15 p-10 w-9/10 xl:w-1/3 h-[55vh] flex flex-col gap-10 glass-blur justify-around items-center text-center";
	mainContainer.appendChild(container3);

	const username = document.createElement("p");
	username.className = "w-9/10 glass-blur text-xl py-1";
	username.textContent = "SECOND default";
	container3.appendChild(username);

	// onUserChange(u => { username.textContent = u?.username || "default"; });

	const inventory = document.createElement("div");
	inventory.className = "w-9/10 flex justify-around";
	container3.appendChild(inventory);

	const ballContainer = document.createElement("div");{
		ballContainer.className = "glass-blur h-[11rem] w-[11rem] p-1";
		inventory.appendChild(ballContainer);

		const ball = document.createElement("img");
		ball.src = "/ball/default_ball.png";
		ball.className = "w-full h-full rounded-xl";
		ballContainer.appendChild(ball);
	}

	const barContainer = document.createElement("div");{
		barContainer.className = "glass-blur h-[11rem] w-[11rem] p-1";
		inventory.appendChild(barContainer);
		
		const bar = document.createElement("img");
		bar.src = "/bar/default_bar.png";
		bar.className = "w-full h-full rounded-xl";
		barContainer.appendChild(bar);
	}
	}

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

	gameHistory.unshift(`${winner} win vs ${loser} (${user1.score}-${user2.score})`);
	if (gameHistory.length > 10) gameHistory.pop();

	const result = document.createElement("h1");
	result.className = "text-8xl text-green-400 mb-8";
	result.textContent = `${winner} win`;
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
	BackBtn.textContent = translations[getCurrentLang()].back_to_menu;
	BackBtn.tabIndex = 0;

	BackBtn.addEventListener('click', () => {
		overlay.classList.add("fade-out");
		setTimeout(() => {
			user1.score = 0;
			user2.score = 0;
			navigateTo("/pong/menu");
		}, 1000);
	});
	setTimeout(() => {
		overlay.classList.add("fade-out");
		setTimeout(() => {
			user1.score = 0;
			user2.score = 0;
			navigateTo("/pong/menu");
		}, 1000);
	}, 5000);

	BackBtnWrapper.appendChild(BackBtn);
	BackContainer.appendChild(BackBtnWrapper);
	overlay.appendChild(BackContainer);

	return overlay;
}

function OnlinePong(score1Elem: HTMLElement, score2Elem: HTMLElement): HTMLElement {
  // Utilise l’origine (5173) + proxy Vite /ws -> back
//   const wsProto = location.protocol === 'https:' ? 'wss' : 'ws';
  const socket = new WebSocket(`wss://localhost:4443/websocket`);

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
      if (input.left  !== 'idle') send({ event: 'move', paddle: 'left',  direction: input.left });
      if (input.right !== 'idle') send({ event: 'move', paddle: 'right', direction: input.right });
    }, TICK_MS);
  }
  function stopSendLoopIfIdle() {
    if (input.left === 'idle' && input.right === 'idle' && sendTimer != null) {
      window.clearInterval(sendTimer);
      sendTimer = null;
    }
  }
  function recomputeFromPressed() {
    const prevLeft = input.left, prevRight = input.right;
    input.left  = pressedKeys.has('w') ? 'up' : (pressedKeys.has('s') ? 'down' : 'idle');
    input.right = pressedKeys.has('ArrowUp') ? 'up' : (pressedKeys.has('ArrowDown') ? 'down' : 'idle');

    if (prevLeft !== input.left && input.left === 'idle')  send({ event: 'stop', paddle: 'left' });
    if (prevRight !== input.right && input.right === 'idle') send({ event: 'stop', paddle: 'right' });

    if (input.left !== 'idle' || input.right !== 'idle') startSendLoop();
    else stopSendLoopIfIdle();
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'w' || e.key === 's' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      pressedKeys.add(e.key);
      recomputeFromPressed();
      e.preventDefault();
    } else if (e.key === 'e') {
      send({ event: 'boost' });
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'w' || e.key === 's' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      pressedKeys.delete(e.key);
      recomputeFromPressed();
      e.preventDefault();
    }
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', () => {
    // sécurité si l’onglet perd le focus
    pressedKeys.clear();
    input.left = input.right = 'idle';
    stopSendLoopIfIdle();
    send({ event: 'stop', paddle: 'left' });
    send({ event: 'stop', paddle: 'right' });
  });

  function cleanup() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    if (sendTimer != null) { window.clearInterval(sendTimer); sendTimer = null; }
    try { socket.close(); } catch {}
  }

  // 3) Assets (render only)
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

  // 4) Canvas
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

  // 5) Etat reçu du serveur
  let state: ServerState | null = null;

  socket.onopen = () => {
      // Optionnel: prévenir qu’on est prêt (et qui on est)
      send({ action: 'join', username: getUser()?.username, avatar: getUser()?.avatar });
  };

  socket.onmessage = (ev) => {
		try {
			const msg = JSON.parse(ev.data);
            // On accepte soit {type:'state', payload:...} soit un snapshot direct
            if (msg?.type === 'state') state = msg.payload as ServerState;
            else state = msg as ServerState;

			console.log(msg);

			state = {
      			ball: msg.ball,
      			paddles: { leftY: msg.leftPaddle?.y ?? 340, rightY: msg.rightPaddle?.y ?? 340 },
      			scores: { left: msg.score?.left ?? 0, right: msg.score?.right ?? 0 },
      			state: msg.event === 'finish' ? 'game_over' : 'playing',
      			winner: msg.winner
      		};

            // MAJ scores + noms (render only)
            if (state?.scores) {
                user1.score = state.scores.left ?? 0;
                user2.score = state.scores.right ?? 0;
                score1Elem.textContent = `${user1.name}: ${user1.score}`;
                score2Elem.textContent = `${user2.name}: ${user2.score}`;
            }

            // Fin de partie pilotée par le back
            if (state?.state === 'game_over') {
                cleanup();
                navigateTo("/pong/online/menu");
            }
        } catch {}
    };

    socket.onclose = () => {
        // Si la partie n’est pas finie mais WS coupé: sortir proprement
        if (state?.state !== 'game_over') {
            cleanup();
            // navigateTo("/pong/menu");
        }
    };

    // 6) Draw loop: on dessine UNIQUEMENT ce que le serveur envoie
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sync assets dynamiques
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

        // Si pas encore d’état, afficher “waiting…”
        if (!state) {
            ctx.fillStyle = "white";
            ctx.font = "24px system-ui";
            ctx.fillText("Waiting for server...", canvas.width/2 - 140, canvas.height/2);
            return;
        }

        // Paddles
        const leftY = state.paddles?.leftY ?? canvas.height/2 - paddleHeight/2;
        const rightY = state.paddles?.rightY ?? canvas.height/2 - paddleHeight/2;

        if (leftBarImgLoaded) ctx.drawImage(leftBarImg, 10, leftY, paddleWidth, paddleHeight);
        else {
            ctx.fillStyle = "white";
            ctx.fillRect(10, leftY, paddleWidth, paddleHeight);
        }

        if (rightBarImgLoaded) ctx.drawImage(rightBarImg, canvas.width - 20, rightY, paddleWidth, paddleHeight);
        else {
            ctx.fillStyle = "white";
            ctx.fillRect(canvas.width - 20, rightY, paddleWidth, paddleHeight);
        }

        // Balle
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
    }

    function loop() {
        draw(); // aucune physique locale
        requestAnimationFrame(loop);
    }

    loop();
    return container;
}

export function PongOnlineGamePage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "gap-2 z-2000 h-full min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-t from-green-500 via-black to-green-800"

	// Nettoyage du container avant d'ajouter le jeu
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

// onUserChange(u => { if (u) user1.name = u.username; });

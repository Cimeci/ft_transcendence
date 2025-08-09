import { getCurrentLang } from "../pages/settings";
import { translations } from '../i18n';
import { navigateTo } from '../routes'
import { userInventory } from "../pages/inventory"

export const gameHistory: string[] = [];

export function PongMenuPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "pt-25 min-h-screen w-full flex items-center justify-center bg-linear-to-bl from-black via-green-900 to-black"
	// mainContainer.className = "pt-25 min-h-screen w-full flex items-center justify-center bg-black"

	const TitlePong = document.createElement("h1");
	TitlePong.className = "pt-25 text-8xl tracking-widest absolute top-0 text-green-400 neon-matrix w-full text-center";
	TitlePong.textContent = "P O N G";
	mainContainer.appendChild(TitlePong);

	const GridContainer = document.createElement("div");
	GridContainer.className = "pong-menu-grid";

	const CosmeticContainer = document.createElement("div");
	CosmeticContainer.className = "grid grid-cols-2 w-[500px] gap-10 text-center min-h-[500px]";
	CosmeticContainer.addEventListener('click', () => {
		navigateTo("/inventory")
	})

	const cosmteticNames = [
		"avatar", "background", "bar", "ball"
	];

	for (let i = 0; i < cosmteticNames.length; i++) {
	    const type = cosmteticNames[i] as keyof typeof userInventory;
	    const firstItem = userInventory[type][0];

	    const itemDiv = document.createElement("div");
    	itemDiv.className = "flex flex-col items-center";

    	const img = document.createElement("img");
    	img.className = "size-40 transition-all duration-300 hover:scale-110 text-3xl tracking-widest text-green-400 neon-matrix border-2 border-green-400 rounded-lg mb-2 w-full h-full";
    	img.src = firstItem.id;
    	img.alt = firstItem.name;

    	itemDiv.appendChild(img);
    	CosmeticContainer.appendChild(itemDiv);
	}

	const PlayContainer = document.createElement("div");
	PlayContainer.className = "flex flex-col justify-center items-center gap-4 text-center";

	const PlayBtnWrapper = document.createElement("div");
	PlayBtnWrapper.className = "relative flex items-center justify-center animated-gradient-border rounded-full p-1 mb-2";

	const PlayBtn = document.createElement("button");
	PlayBtn.className = "relative z-10 cursor-pointer transition-all duration-300 hover:scale-98 text-7xl tracking-widest text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none";
	PlayBtn.textContent = "P L A Y";

	PlayBtn.addEventListener('click', () => {
		mainContainer.classList.add("fade-out");
    	setTimeout(() => {
        	user1.score = 0;
        	user2.score = 0;
        	navigateTo("/pong/game");
    	}, 1000);
	});

	PlayBtnWrapper.appendChild(PlayBtn);
	PlayContainer.appendChild(PlayBtnWrapper);

	const getName1 = document.createElement("input");
	getName1.className = "mt-10 relative z-10 text-3xl text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none"
	getName1.placeholder = translations[getCurrentLang()].username1;
	getName1.addEventListener("input", () => {
	    user1.name = getName1.value;
	});
	PlayContainer.appendChild(getName1);

	const getName2 = document.createElement("input");
	getName2.className = "relative z-10 text-3xl text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none"
	getName2.placeholder = translations[getCurrentLang()].username2;
	getName2.addEventListener("input", () => {
	    user2.name = getName2.value;
	});
	PlayContainer.appendChild(getName2);

	const HistoryContainer = document.createElement("div");
	HistoryContainer.className = "history border-2 border-green-400 rounded-xl flex flex-col items-center text-center gap-4 h-[60vh] w-[400px]";

    const HistoryTitle = document.createElement("h2");
    HistoryTitle.className = "border-2 border-green-400 w-full rounded-xl p-2 text-5xl tracking-widest neon-matrix mb-4";
    HistoryTitle.textContent = "H I S T O R Y";
    HistoryContainer.appendChild(HistoryTitle);

	const historyList = document.createElement("ul");
    historyList.className = "text-xl text-green-300 text-center";

    gameHistory.forEach(game => {
        const li = document.createElement("li");
        li.textContent = game;
        historyList.appendChild(li);
    });
    HistoryContainer.appendChild(historyList);

	GridContainer.appendChild(CosmeticContainer)
	GridContainer.appendChild(PlayContainer);
	GridContainer.appendChild(HistoryContainer);

	mainContainer.appendChild(GridContainer);

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

export function PongOverlayPage(): HTMLElement {
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
	BackBtnWrapper.className = "relative flex items-center justify-center animated-gradient-border rounded-full p-1 mb-2";

	const BackBtn = document.createElement("button");
	BackBtn.className = "relative z-10 cursor-pointer transition-all duration-300 hover:scale-98 text-7xl tracking-widest text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none";
	BackBtn.textContent = translations[getCurrentLang()].back_to_menu;
	BackBtn.tabIndex = 0;

	BackBtn.addEventListener('click', () => {
		overlay.classList.add("fade-out");
    	setTimeout(() => {
        	user1.score = 0;
        	user2.score = 0;
        	navigateTo("/pong");
    	}, 1000);
	});
	setTimeout(() => {
    	overlay.classList.add("fade-out");
    	setTimeout(() => {
        	user1.score = 0;
        	user2.score = 0;
        	navigateTo("/pong");
    	}, 1000);
	}, 5000);

	BackBtnWrapper.appendChild(BackBtn);
	BackContainer.appendChild(BackBtnWrapper);
    overlay.appendChild(BackContainer);

    return overlay;
}

function Pong(score1Elem: HTMLElement, score2Elem: HTMLElement): HTMLElement {
	const container = document.createElement("div");
	container.className = "relative flex flex-col items-center justify-center";

	// Utilise directement le cosmétique en position 0 (image réelle servie depuis /public)
	const resolveBallPath = () => {
		const raw = userInventory.ball[0]?.id || '';
		return raw.startsWith('/') ? raw : '/' + raw; // garantit le chemin absolu pour Vite (/public)
	};
	let currentBallSrc = resolveBallPath();
	const ballImg = new Image();
	ballImg.src = currentBallSrc;
	let ballImgLoaded = false;
	ballImg.onload = () => { ballImgLoaded = true; };

	// Skin de la barre gauche (bar[0])
	const resolveBarPath = () => {
		const raw = userInventory.bar[0]?.src || '';
		return raw.startsWith('/') ? raw : '/' + raw;
	};
	let currentBarSrc = resolveBarPath();
	const leftBarImg = new Image();
	leftBarImg.src = currentBarSrc;	
	let leftBarImgLoaded = false;
	leftBarImg.onload = () => { leftBarImgLoaded = true; };

	// Skin de la barre droite (bar[1])
	const resolveRightBarPath = () => {
		const raw = userInventory.bar[1]?.src || userInventory.bar[0]?.src || '';
		return raw.startsWith('/') ? raw : '/' + raw;
	};
	let currentRightBarSrc = resolveRightBarPath();
	const rightBarImg = new Image();
	rightBarImg.src = currentRightBarSrc;
	let rightBarImgLoaded = false;
	rightBarImg.onload = () => { rightBarImgLoaded = true; };

	const canvas = document.createElement("canvas");
	canvas.width = 1200;
	canvas.height = 800;
	canvas.className = "border-2 bg-[url(" + (userInventory.background[0].id.startsWith('/')?userInventory.background[0].id:'/'+userInventory.background[0].id) + ")]";
	canvas.tabIndex = 0;
	canvas.focus();
	container.appendChild(canvas);

	const ctx = canvas.getContext("2d")!;
	const paddleWidth = 10;
	const paddleHeight = 120;
	const speed = 6;

	const leftPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2 };
	const rightPaddle = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2 };

	const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 20, speedX: 5, speedY: 5 };

	const keys: Record<string, boolean> = {};
	document.addEventListener("keydown", (e) => {
	  keys[e.key] = true;
	  if (e.key === "Escape" || e.key === "Esc" || e.key === "echap") {
	    const parent = container.parentElement;
	    if (parent) parent.innerHTML = "";
	    navigateTo("/pong");
	  }
	  if (e.key === "q") {
	    user1.score = 5;
	  }
	  if (e.key === "e") {
	    ball.speedX *= 1.1;
	    ball.speedY *= 1.1;
	  }
	});
	document.addEventListener("keyup", (e) => { keys[e.key] = false; });

	function resetBall() {
	  ball.x = canvas.width / 2;
	  ball.y = canvas.height / 2;
	  const speed = canvas.width / 200;
	  const maxAngle = Math.PI / 4;
	  let angle = 0;
	  do {
	    angle = (Math.random() * 2 - 1) * maxAngle;
	  } while (Math.abs(angle) < 0.1);
	  const direction = Math.random() < 0.5 ? -1 : 1;
	  ball.speedX = Math.cos(angle) * speed * direction;
	  ball.speedY = Math.sin(angle) * speed;
	}

	let prevScore1 = user1.score;
	let prevScore2 = user2.score;
	let isGameOver = false;
	let overlayTriggered = false;

	function update() {
		if (isGameOver) return;
		if (keys["echap"]) return;
		if (keys["w"] && leftPaddle.y > 2) leftPaddle.y -= speed;
		if (keys["s"] && leftPaddle.y + paddleHeight < canvas.height - 2) leftPaddle.y += speed;
		if (keys["ArrowUp"] && rightPaddle.y > 2) rightPaddle.y -= speed;
		if (keys["ArrowDown"] && rightPaddle.y + paddleHeight < canvas.height - 2) rightPaddle.y += speed;
		ball.x += ball.speedX;
		ball.y += ball.speedY;
		if (ball.y < 0 || ball.y > canvas.height) ball.speedY *= -1;
		const hitLeft = ball.x - ball.radius < leftPaddle.x + paddleWidth && ball.y > leftPaddle.y && ball.y < leftPaddle.y + paddleHeight;
		const hitRight = ball.x + ball.radius > rightPaddle.x && ball.y > rightPaddle.y && ball.y < rightPaddle.y + paddleHeight;
		if (hitLeft || hitRight) ball.speedX *= -1;
		if (ball.x < 0) { user2.score++; resetBall(); ball.speedX *= -1; }
		if (ball.x > canvas.width) { user1.score++; resetBall(); ball.speedX *= -1; }
		if (user1.score === 5 || user2.score === 5) {
			isGameOver = true;
		}
		ball.speedX *= 1.0005;
		ball.speedY *= 1.0005;
	}

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "white";
		// Mise à jour dynamique si le skin bar gauche a changé
		const latestBar = resolveBarPath();
		if (latestBar !== currentBarSrc) {
			currentBarSrc = latestBar;
			leftBarImgLoaded = false;
			leftBarImg.src = currentBarSrc;
		}
		// Mise à jour dynamique si le skin bar droite a changé
		const latestRightBar = resolveRightBarPath();
		if (latestRightBar !== currentRightBarSrc) {
			currentRightBarSrc = latestRightBar;
			rightBarImgLoaded = false;
			rightBarImg.src = currentRightBarSrc;
		}
		// Dessin left paddle avec skin
		if (leftBarImgLoaded) {
			ctx.drawImage(leftBarImg, leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
		} else {
			ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
		}
		// Dessin right paddle avec skin index 1 (fallback index 0)
		if (rightBarImgLoaded) {
			ctx.drawImage(rightBarImg, rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);
		} else {
			ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);
		}

		// Si l'utilisateur a changé le skin (index 0 modifié) avant le lancement, on ne regénère pas de forme : on dessine l'image brute.
		const latest = resolveBallPath();
		if (latest !== currentBallSrc) {
			currentBallSrc = latest;
			ballImgLoaded = false;
			ballImg.src = currentBallSrc;
		}
		if (ballImgLoaded) {
			ctx.drawImage(ballImg, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
		} else {
			ctx.fillStyle = "rgba(255,255,255,0.3)";
			ctx.beginPath();
			ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
			ctx.fill();
		}

		if (user1.score !== prevScore1) { score1Elem.textContent = user1.name + ": " + user1.score; prevScore1 = user1.score; }
		if (user2.score !== prevScore2) { score2Elem.textContent = user2.name + ": " + user2.score; prevScore2 = user2.score; }
	}

	function loop() {
		if (!isGameOver) {
			update();
			draw();
			requestAnimationFrame(loop);
		} else if (!overlayTriggered) {
			overlayTriggered = true;
			navigateTo("/pong/game/overlay");
		}
	}

	resetBall();
	loop();

	return container;
}

export function PongGamePage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "gap-10 z-2000 h-full min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-t from-green-500 via-black to-green-800"

	// Nettoyage du container avant d'ajouter le jeu
	mainContainer.innerHTML = "";

	const TitlePong = document.createElement("h1");
	TitlePong.className = "text-8xl tracking-widest text-green-400 neon-matrix w-full text-center";
	TitlePong.textContent = "P O N G";
	mainContainer.appendChild(TitlePong);

	const ScorePong = document.createElement("div");
	ScorePong.className = "w-[800px] flex";

	const Score1 = document.createElement("h1");
	Score1.className = "text-4xl tracking-widest text-green-400 neon-matrix w-full text-left";
	Score1.textContent = user1.name + ": " + user1.score
	ScorePong.appendChild(Score1);

	const Score2 = document.createElement("h1");
	Score2.className = "text-4xl tracking-widest text-green-400 neon-matrix w-full text-right";
	Score2.textContent = user2.name + ": " + user2.score
	ScorePong.appendChild(Score2);

	mainContainer.appendChild(ScorePong);

	const canvas = Pong(Score1, Score2);
	mainContainer.appendChild(canvas);

	return mainContainer;
}
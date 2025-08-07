import { getCurrentLang } from "../pages/settings";
import { translations } from '../i18n';
import { navigateTo } from '../routes'

export function PongMenuPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "pt-25 min-h-screen w-full flex items-center justify-center bg-linear-to-bl from-black via-green-900 to-black"
	// mainContainer.className = "pt-25 min-h-screen w-full flex items-center justify-center bg-black"

	const TitlePong = document.createElement("h1");
	TitlePong.className = "pt-25 text-8xl tracking-widest absolute top-0 text-green-400 neon-matrix w-full text-center translate-x-6";
	TitlePong.textContent = "P O N G";
	mainContainer.appendChild(TitlePong);

	const GridContainer = document.createElement("div");
	GridContainer.className = "pong-menu-grid";

	const CosmeticContainer = document.createElement("div");
	CosmeticContainer.className = "flex flex-col items-center gap-10 text-center grid grid-cols-2 w-110 min-h-[400px]";

	const cosmteticNames = [
		"avatar", "gamebackground", "bar", "ball"
	];
	
	const cosmeticLinks = [
		"./public/avatar/matrix_avatar.png",
		"./public/bg/matrix_background.png",
		"./public/bar/matrix_bar.png",
		"./public/ball/matrix_ball.png",
	];

	for (let i = 0; i < cosmteticNames.length;i++)
	{
		const img = document.createElement("img");
		img.className = "size-40 cursor-pointer transition-all duration-300 hover:scale-110 r:scale-110 text-3xl tracking-widest text-green-400 neon-matrix border-2 border-green-400 rounded-lg px-6 py-2 mb-2 w-full h-full";
		img.textContent = translations[getCurrentLang()][cosmteticNames[i] as keyof typeof translations['en']];
		img.src = cosmeticLinks[i];
        CosmeticContainer.appendChild(img);
	}

	const PlayContainer = document.createElement("div");
	PlayContainer.className = "flex flex-col justify-center items-center gap-4 text-center";

	const PlayBtnWrapper = document.createElement("div");
	PlayBtnWrapper.className = "relative flex items-center justify-center animated-gradient-border rounded-full p-1 mb-2";

	const PlayBtn = document.createElement("button");
	PlayBtn.className = "relative z-10 cursor-pointer transition-all duration-300 hover:scale-98 text-7xl tracking-widest text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none";
	// PlayBtn.className = "relative z-10 cursor-point er transition-all duration-300 hover:scale-110 text-7xl tracking-widest text-green-400 neon-matrix rounded-full px-12 py-6 bg-black border-none";
	PlayBtn.textContent = "P L A Y";

	PlayBtn.addEventListener('click', () => {
		navigateTo("/pong/game");
		user1score = 0;
		user2score = 0;
	});

	PlayBtnWrapper.appendChild(PlayBtn);
	PlayContainer.appendChild(PlayBtnWrapper);

	const HistoryContainer = document.createElement("div");
	HistoryContainer.className = "history border-2 rounded-xl flex flex-col items-center text-center gap-4 h-[60vh]";

    const HistoryTitle = document.createElement("h2");
    HistoryTitle.className = "border-2 w-full rounded-xl p-2 text-5xl tracking-widest text-green-400 neon-matrix mb-4";
    HistoryTitle.textContent = "H I S T O R Y";
    HistoryContainer.appendChild(HistoryTitle);

	const historyList = document.createElement("ul");
    historyList.className = "text-xl text-green-300 text-center";
    const lastGames = [
        "Win vs Alice (5-3)",
        "Lose vs Bob (2-5)",
        "Win vs Charlie (7-6)",
        "Lose vs Eve (1-5)"
    ];
    lastGames.forEach(game => {
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

let user1score: number = 0;
let user2score: number = 0;

export function PongOverlayPage(): HTMLElement {
	const overlay = document.createElement("div");
	overlay.className = "fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-80 z-50";

	const result = document.createElement("h1");
	result.className = "text-6xl text-green-400 mb-8";
	result.textContent = (user1score === 5) ? "user1 win" : "user2 win";
	overlay.appendChild(result);

	const scoreResult = document.createElement("h1");
	scoreResult.className = "text-6xl text-green-400 mb-8";
	scoreResult.textContent = String(user1score) + " | " + String(user2score);
	overlay.appendChild(scoreResult);

	const backBtn = document.createElement("button");
	backBtn.className = "px-8 py-4 text-3xl rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all";
	backBtn.textContent = "Retour au menu Pong";
	backBtn.onclick = () => {
		user1score = 0;
		user2score = 0;
		navigateTo("/pong");
	};
	overlay.appendChild(backBtn);

	return overlay;
}

function Pong(score1Elem: HTMLElement, score2Elem: HTMLElement): HTMLElement {
	const container = document.createElement("div");
	container.className = "relative flex flex-col items-center justify-center";

	const canvas = document.createElement("canvas");
	canvas.width = 800;
	canvas.height = 600;
	canvas.className = "border-2";
	container.appendChild(canvas);

	const ctx = canvas.getContext("2d")!;
	const paddleWidth = 10;
	const paddleHeight = 100;
	const speed = 6;

	const leftPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2 };
	const rightPaddle = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2 };

	const ball = {
	  x: canvas.width / 2,
	  y: canvas.height / 2,
	  radius: 10,
	  speedX: 5,
	  speedY: 5
	};

	const keys: Record<string, boolean> = {};
	document.addEventListener("keydown", (e) => {
	  keys[e.key] = true;
	  if (e.key === "Escape" || e.key === "Esc" || e.key === "echap") {
	    const parent = container.parentElement;
	    if (parent) parent.innerHTML = "";
	    navigateTo("/pong");
	  }
	  if (e.key === "q") {
	    user1score = 5;
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

	let prevScore1 = user1score;
	let prevScore2 = user2score;
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
		if (ball.x < 0) { user2score++; resetBall(); ball.speedX *= -1; }
		if (ball.x > canvas.width) { user1score++; resetBall(); ball.speedX *= -1; }
		if (user1score === 5 || user2score === 5) {
			isGameOver = true;
		}
	}

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "white";
		ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
		ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
		ctx.fill();
		if (user1score !== prevScore1) { score1Elem.textContent = "user1: " + user1score; prevScore1 = user1score; }
		if (user2score !== prevScore2) { score2Elem.textContent = "user2: " + user2score; prevScore2 = user2score; }
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
	TitlePong.className = "text-8xl tracking-widest text-green-400 neon-matrix w-full text-center translate-x-6";
	TitlePong.textContent = "P O N G";
	mainContainer.appendChild(TitlePong);

	const ScorePong = document.createElement("div");
	ScorePong.className = "w-[800px] flex";

	const Score1 = document.createElement("h1");
	Score1.className = "text-4xl tracking-widest text-green-400 neon-matrix w-full text-left";
	Score1.textContent = "user1: " + user1score
	ScorePong.appendChild(Score1);

	const Score2 = document.createElement("h1");
	Score2.className = "text-4xl tracking-widest text-green-400 neon-matrix w-full text-right";
	Score2.textContent = "user2: " + user2score
	ScorePong.appendChild(Score2);

	mainContainer.appendChild(ScorePong);

	const canvas = Pong(Score1, Score2);
	mainContainer.appendChild(canvas);

	return mainContainer;
}
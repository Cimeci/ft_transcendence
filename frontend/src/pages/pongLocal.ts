import { getCurrentLang, t } from "./settings";
import { translations } from '../i18n';
import { navigateTo } from '../routes';
import { onUserChange } from "../linkUser";
import { CreateWrappedButton } from "../components/utils";
import { getUser } from "../linkUser";
import { getUserInventory } from "./inventory";

export const gameHistory: string[] = [];

export function PongLocalMenuPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "p-10 pt-25 min-h-screen w-full flex flex-col xl:flex-row items-center justify-center gap-10 bg-linear-to-bl from-black via-green-900 to-black"


	const TitlePong = document.createElement("h1");
	TitlePong.className = "pt-25 text-6xl sm:text-8xl tracking-widest absolute top-0 text-green-400 neon-matrix w-full text-center";
	TitlePong.textContent = t.local;
	mainContainer.appendChild(TitlePong);

	const container1 = document.createElement("div");{
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
		bar.src = "/bar/default_bar.png";
		bar.className = "w-full h-full rounded-xl";
		barContainer.appendChild(bar);

	async function getSetupUser1() {
		const inventory = await getUserInventory();
       	if (!inventory) return;

		console.log("INVENTORY: ", inventory)
		bar.src = inventory["paddle_use"]?.[0]?.id;
		user1.paddle = inventory["paddle_use"]?.[0]?.id;
	}
	getSetupUser1();
	
	}

	const container2 = document.createElement("div");{
	container2.className = "mt-15 p-5 w-9/10 xl:w-2/3 h-[60vh] flex flex-col gap-4 glass-blur justify-around items-center text-center";
	mainContainer.appendChild(container2);

	const playBtn = CreateWrappedButton(mainContainer, t.play, "/pong/local/game", 5);
	container2.appendChild(playBtn);

	const GlobalValue = document.createElement("div");
	GlobalValue.className = "w-full flex justify-around"
	container2.appendChild(GlobalValue);

	const bgContainer = document.createElement("div");
		bgContainer.className = "glass-blur h-[14rem] w-[14rem] flex flex-col gap-2 p-1";
		GlobalValue.appendChild(bgContainer);
		
		const bgTxt = document.createElement("p");
		bgTxt.textContent = t.gamebackground;
		bgContainer.appendChild(bgTxt);

		const bg = document.createElement("img");
		bg.src = "/bg/default_bg.gif";
		bg.className = "m-auto w-full rounded-xl";
		bgContainer.appendChild(bg);

	const ballContainer = document.createElement("div");
		ballContainer.className = "glass-blur h-[14rem] w-[14rem] flex flex-col gap-2 p-1";
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

	async function getSetupUser() {
		const inventory = await getUserInventory();
       	if (!inventory) return;

		console.log("INVENTORY: ", inventory)
		ball.src = inventory["ball_use"]?.[0]?.id;
		Ball_src = inventory["ball_use"]?.[0]?.id;
		bg.src = inventory["background_use"]?.[0]?.id;
		Bg_src = inventory["background_use"]?.[0]?.id;
	}
	getSetupUser();

	}

	const container3 = document.createElement("div");{
	container3.className = "mt-15 p-10 w-9/10 xl:w-1/3 h-[55vh] flex flex-col gap-10 glass-blur justify-around items-center text-center";
	mainContainer.appendChild(container3);

	const username = document.createElement("input");
	username.className = "w-9/10 glass-blur text-xl px-1 py-1";
	username.textContent = "second Username";
	username.addEventListener(("input"), () => {
		user2.name = username.value;
	})
	container3.appendChild(username);

	const inventory = document.createElement("div");
	inventory.className = "w-9/10 flex justify-around";
	container3.appendChild(inventory);

	const barContainer = document.createElement("div");{
		barContainer.className = "glass-blur h-[11rem] w-[11rem] p-1";
		inventory.appendChild(barContainer);
		
		const bar = document.createElement("img");
		bar.src = "/bar/default_bar.png";
		user2.paddle = "/bar/default_bar.png";
		bar.className = "w-full h-full rounded-xl";
		barContainer.appendChild(bar);
	}
	}

	return (mainContainer);
}

let Bg_src = "/bg/default_bg.png";
let Ball_src = "/ball/default_ball.png";

export interface User {
	name: string;
	paddle: string;
	score: number;
}

export const user1: User = {
	name: "user1",
	paddle: "/playbar/default_bar.png",
	score: 0,
};

export const user2: User = {
	name: "user2",
	paddle: "/playbar/default_bar.png",
	score: 0,
};

export function PongLocalOverlayPage(): HTMLElement {
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
			navigateTo("/pong/local/menu");
		}, 1000);
	});
	setTimeout(() => {
		overlay.classList.add("fade-out");
		setTimeout(() => {
			user1.score = 0;
			user2.score = 0;
			navigateTo("/pong/local/menu");
		}, 1000);
	}, 5000);

	BackBtnWrapper.appendChild(BackBtn);
	BackContainer.appendChild(BackBtnWrapper);
	overlay.appendChild(BackContainer);

	return overlay;
}

function LocalPong(score1Elem: HTMLElement, score2Elem: HTMLElement): HTMLElement {
	const container = document.createElement("div");
	container.className = "relative flex flex-col items-center justify-center";

	// GESTION DES TOUCHES
	const keys: Record<string, boolean> = {};
	const onKeyDown = (e: KeyboardEvent) => {
		keys[e.key] = true;
	};
	const onKeyUp = (e: KeyboardEvent) => {
		keys[e.key] = false;
	};
	window.addEventListener('keydown', onKeyDown);
	window.addEventListener('keyup', onKeyUp);

	function cleanup() {
		window.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('keyup', onKeyUp);
	}

	const resolveBallPath = () => {
		const raw = Ball_src;
		return raw.startsWith('/') ? raw : '/' + raw;
	};
	let currentBallSrc = resolveBallPath();
	const ballImg = new Image();
	ballImg.src = currentBallSrc;
	let ballImgLoaded = false;
	ballImg.onload = () => { ballImgLoaded = true; };

	const resolveBarPath = () => {
		const raw = user1.paddle.replace("/bar/", "/playbar/");
		return raw.startsWith('/') ? raw : '/' + raw;
	};
	let currentBarSrc = resolveBarPath();
	const leftBarImg = new Image();
	leftBarImg.src = currentBarSrc;	
	let leftBarImgLoaded = false;
	leftBarImg.onload = () => { leftBarImgLoaded = true; };

	const resolveRightBarPath = () => {
		const raw = user2.paddle.replace("bar", "playbar");
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
	const bgUrl = Bg_src;
	canvas.className = "border-2 w-[70vw] h-[80vh]";
	canvas.style.backgroundImage = `url('${bgUrl}')`;
	canvas.style.backgroundSize = "cover";
	canvas.style.backgroundPosition = "center";
	canvas.style.backgroundRepeat = "no-repeat";
	container.appendChild(canvas);

	const ctx = canvas.getContext("2d")!;
	const paddleWidth = 10;
	const paddleHeight = 120;
	const speed = 6;

	const leftPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2 };
	const rightPaddle = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2 };

	const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 20, speedX: 5, speedY: 5 };
	let ballRotation = 0;
	const BALL_SPIN_STEP = Math.PI / 6;

	let launchTimeout: number | null = null; // <-- ajouté

	function resetBall(forceDirection?: number) {
		// Position centrale
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		// Stoppe la balle pendant l’attente
		ball.speedX = 0;
		ball.speedY = 0;
		ballRotation = 0;

		// Annule un éventuel timer précédent
		if (launchTimeout !== null) {
			clearTimeout(launchTimeout);
		}

		const speed = canvas.width / 200;
		const maxAngle = Math.PI / 4;

		launchTimeout = window.setTimeout(() => {
			let angle = 0;
			do {
				angle = (Math.random() * 2 - 1) * maxAngle;
			} while (Math.abs(angle) < 0.1);

			const direction = forceDirection ?? (Math.random() < 0.5 ? -1 : 1);
			ball.speedX = Math.cos(angle) * speed * direction;
			ball.speedY = Math.sin(angle) * speed;
			launchTimeout = null;
		}, 3000); // 3 secondes d’attente
	}

	let prevScore1 = user1.score;
	let prevScore2 = user2.score;
	let isGameOver = false;
	let overlayTriggered = false;

	function update() {
		if (isGameOver) return;
		if (keys["Escape"]) return;
		if (keys["q"]) user1.score = 5;
		if (keys["e"]) {ball.speedX *= 1.1; ball.speedY *= 1.1;}

		if (keys["w"] && leftPaddle.y > 2) leftPaddle.y -= speed;
		if (keys["s"] && leftPaddle.y + paddleHeight < canvas.height - 2) leftPaddle.y += speed;
		if (keys["ArrowUp"] && rightPaddle.y > 2) rightPaddle.y -= speed;
		if (keys["ArrowDown"] && rightPaddle.y + paddleHeight < canvas.height - 2) rightPaddle.y += speed;
		ball.x += ball.speedX;
		ball.y += ball.speedY;
		if (ball.y < 0 || ball.y > canvas.height) ball.speedY *= -1;
		// Collisions paddles
		const hitLeft = ball.x - ball.radius < leftPaddle.x + paddleWidth && ball.y > leftPaddle.y && ball.y < leftPaddle.y + paddleHeight;
		const hitRight = ball.x + ball.radius > rightPaddle.x && ball.y > rightPaddle.y && ball.y < rightPaddle.y + paddleHeight;
		if (hitLeft || hitRight) {
			ball.speedX *= -1;
			ballRotation += BALL_SPIN_STEP;
		}

		// Score (on passe la direction du prochain service)
		if (ball.x < 0) {
			user2.score++;
			resetBall(1);   // relance vers le joueur 1 (à droite)
		}
		if (ball.x > canvas.width) {
			user1.score++;
			resetBall(-1);  // relance vers le joueur 2 (à gauche)
		}

		if (user1.score === 5 || user2.score === 5) {
			isGameOver = true;
			if (launchTimeout !== null) {
				clearTimeout(launchTimeout);
				launchTimeout = null;
			}
		}

		// Accélération progressive uniquement si la balle est en mouvement
		if (ball.speedX !== 0 || ball.speedY !== 0) {
			ball.speedX *= 1.0005;
			ball.speedY *= 1.0005;
		}
	}

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height); // Laisse le GIF CSS visible

		ctx.fillStyle = "white";

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

		// Paddles
		if (leftBarImgLoaded) ctx.drawImage(leftBarImg, leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
		else ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);

		if (rightBarImgLoaded) ctx.drawImage(rightBarImg, rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);
		else ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);

		// Balle
		const latest = resolveBallPath();
		if (latest !== currentBallSrc) {
			currentBallSrc = latest;
			ballImgLoaded = false;
			ballImg.src = currentBallSrc;
		}
		if (ballImgLoaded) {
			ctx.save();
			ctx.translate(ball.x, ball.y);
			ctx.rotate(ballRotation);
			ctx.drawImage(ballImg, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
			ctx.restore();
		} else {
			ctx.save();
			ctx.translate(ball.x, ball.y);
			ctx.rotate(ballRotation);
			ctx.fillStyle = "rgba(255,255,255,0.6)";
			ctx.beginPath();
			ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
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
			cleanup();
			navigateTo("/pong/local/game/overlay");
		}
	}

	// Au lancement du jeu
	resetBall();
	loop();

	return container;
}

export function PongLocalGamePage(): HTMLElement {
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

	async function getAvatarUser1() {
		const inventory = await getUserInventory();
        if (!inventory) return;

		Avatar1.src = inventory["avatar_use"]?.[0]?.id;
	}

	const Avatar1 = document.createElement("img");
	Avatar1.src = "/avatar/default_avatar.png";
	Avatar1.className = "border-1 size-15 rounded-lg";
	getAvatarUser1();
	Profile1.appendChild(Avatar1);

	const Score1 = document.createElement("h1");
	Score1.className = "text-3xl tracking-widest text-green-400 neon-matrix";
	Score1.textContent = user1.name + ": " + user1.score
	Profile1.appendChild(Score1);

	const Profile2 = document.createElement("div");
	Profile2.className = "flex items-end gap-3"

	const Avatar2 = document.createElement("img");
	Avatar2.src = "/avatar/default_avatar.png";
	Avatar2.className = "border-1 size-15 rounded-lg";
	Profile2.appendChild(Avatar2);

	const Score2 = document.createElement("h1");
	Score2.className = "text-3xl tracking-widest text-green-400 neon-matrix";
	Score2.textContent = user2.name + ": " + user2.score
	Profile2.appendChild(Score2);

	ScorePong.appendChild(Profile1);
	ScorePong.appendChild(Profile2);

	mainContainer.appendChild(ScorePong);

	const canvas = LocalPong(Score1, Score2);
	mainContainer.appendChild(canvas);

	return mainContainer;
}

onUserChange(u => { if (u) user1.name = u.username; });
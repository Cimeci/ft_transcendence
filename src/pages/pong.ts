import { getCurrentLang } from "../pages/settings";
import { translations } from '../i18n';
import { navigateTo } from '../routes'
import { userInventory, userName } from "../pages/inventory"

export const gameHistory: string[] = [];

export function CreateWrappedButton(mainContainer: HTMLElement, txt: string, path: string, size: number): HTMLElement {
	const PlayContainer = document.createElement("div");
	PlayContainer.className = "flex flex-col justify-center items-center gap-4 text-center";

	const PlayBtnWrapper = document.createElement("div");
	// Wrapper légèrement plus grand que le bouton, plus fin
	PlayBtnWrapper.className = "relative inline-flex items-center justify-center animated-gradient-border rounded-full p-[clamp(2px,0.6vw,8px)] mb-2 w-fit h-fit";

	const PlayBtn = document.createElement("button");
	PlayBtn.className = "relative z-10 inline-flex items-center justify-center whitespace-nowrap leading-none w-fit h-fit cursor-pointer transition-all duration-300 hover:scale-98 text-" + String(size) + "xl tracking-widest text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none";
	PlayBtn.textContent = txt;

	PlayBtn.addEventListener('click', () => {
		if (path != "null")
		{
			mainContainer.classList.add("fade-out");
			setTimeout(() => {
				user1.score = 0;
				user2.score = 0;
				navigateTo(path);
			}, 1000);
		}
	});

	PlayBtnWrapper.appendChild(PlayBtn);
	PlayContainer.appendChild(PlayBtnWrapper);

	return (PlayContainer);
}

export function PongMenuPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "pt-25 min-h-screen w-full flex items-center justify-center bg-linear-to-bl from-black via-green-900 to-black"

	const TitlePong = document.createElement("h1");
	TitlePong.className = "pt-25 text-8xl tracking-widest absolute top-0 text-green-400 neon-matrix w-full text-center";
	TitlePong.textContent = "P O N G";
	mainContainer.appendChild(TitlePong);

	const GridContainer = document.createElement("div");
	GridContainer.className = "gap-10 pong-menu-grid";

	const CosmeticContainer = document.createElement("div");
	CosmeticContainer.className = "grid grid-cols-2 w-[25vw] gap-10 text-center h-[50vh]";
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
		img.className = "rounded-xl p-4 size-40 transition-all duration-300 hover:scale-110 text-3xl tracking-widest text-green-400 neon-matrix border-2 border-green-400 rounded-lg mb-2 w-full h-full hover:p-1";
		img.src = firstItem.id;
		img.alt = firstItem.name;

		itemDiv.appendChild(img);
		CosmeticContainer.appendChild(itemDiv);
	}

	const PlayContainer = CreateWrappedButton(mainContainer, translations[getCurrentLang()].play, "/pong/game", 7)

	// const getName1 = document.createElement("input");
	// getName1.className = "mt-10 relative z-10 text-3xl text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none"
	// getName1.placeholder = translations[getCurrentLang()].username1;
	// getName1.maxLength = 16;
	// getName1.addEventListener("input", () => {
	// 	user1.name = getName1.value;
	// });
	// PlayContainer.appendChild(getName1);

	const getName2 = document.createElement("input");
	getName2.className = "mt-10 relative z-10 text-3xl text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none"
	getName2.placeholder = translations[getCurrentLang()].username2;
	getName2.maxLength = 16;
	getName2.addEventListener("input", () => {
		user2.name = getName2.value;
	});
	PlayContainer.appendChild(getName2);

	const HistoryContainer = document.createElement("div");
	HistoryContainer.className = "history border-5 border-green-400 rounded-xl flex flex-col items-center text-center w-[25vw] h-[70vh]";

	const HistoryTitle = document.createElement("h2");
	HistoryTitle.className = "border-green-400 w-full rounded-xl p-2 text-5xl tracking-widest neon-matrix";
	HistoryTitle.textContent = translations[getCurrentLang()].history.toUpperCase();
	HistoryContainer.appendChild(HistoryTitle);

	const line = document.createElement("p");
	line.className = "border-3 border-green-400 w-full mb-4";
	HistoryContainer.appendChild(line);

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
	name: userName,
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
	// Wrapper légèrement plus grand que le bouton, plus fin
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
		const raw = userInventory.ball[0]?.id || '';
		return raw.startsWith('/') ? raw : '/' + raw;
	};
	let currentBallSrc = resolveBallPath();
	const ballImg = new Image();
	ballImg.src = currentBallSrc;
	let ballImgLoaded = false;
	ballImg.onload = () => { ballImgLoaded = true; };

	const resolveBarPath = () => {
		const raw = userInventory.bar[0]?.src || '';
		return raw.startsWith('/') ? raw : '/' + raw;
	};
	let currentBarSrc = resolveBarPath();
	const leftBarImg = new Image();
	leftBarImg.src = currentBarSrc;	
	let leftBarImgLoaded = false;
	leftBarImg.onload = () => { leftBarImgLoaded = true; };

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
    canvas.width = 1400;
    canvas.height = 800;
    const bgUrl = userInventory.background[0].id.startsWith('/')
        ? userInventory.background[0].id
        : '/' + userInventory.background[0].id;
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
			navigateTo("/pong/game/overlay");
		}
	}

	// Au lancement du jeu
    resetBall();
	loop();

	return container;
}

export function PongGamePage(): HTMLElement {
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
	Avatar1.src = "/" + userInventory.avatar[0].id;
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

	const canvas = Pong(Score1, Score2);
	mainContainer.appendChild(canvas);

	return mainContainer;
}
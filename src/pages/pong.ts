import { getCurrentLang } from "../pages/settings";
import { translations } from '../i18n';

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
	PlayBtn.className = "relative z-10 cursor-pointer transition-all duration-300 hover:scale-110 text-7xl tracking-widest text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none";
	// PlayBtn.className = "relative z-10 cursor-point er transition-all duration-300 hover:scale-110 text-7xl tracking-widest text-green-400 neon-matrix rounded-full px-12 py-6 bg-black border-none";
	PlayBtn.textContent = "P L A Y";

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

export function PongGamePage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "z-2000 pt-0 min-h-screen w-full flex items-center justify-center gap-4 bg-linear-to-t from-green-500 via-black to-green-800"

	return (mainContainer);
}
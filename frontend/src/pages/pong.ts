import { t } from "./settings";
import { translations } from '../i18n';
import { navigateTo } from '../routes';
import { onUserChange } from "../linkUser";


export function PongMenuPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "pt-25 min-h-screen w-full flex items-center justify-center bg-linear-to-bl from-black via-green-900 to-black"

	const TitlePong = document.createElement("h1");
	TitlePong.className = "pt-25 text-6xl sm:text-8xl tracking-widest absolute top-0 text-green-400 neon-matrix w-full text-center";
	TitlePong.textContent = "P O N G";
	mainContainer.appendChild(TitlePong);

	const MenuContainer = document.createElement("div");
	MenuContainer.className = "mt-20 w-full p-10 grid gap-10 xl:gap-2 2xl:gap-10 grid-cols-2 items-start xl:grid-cols-3";
	mainContainer.appendChild(MenuContainer);

	const LocalContainer = document.createElement("div");{
	LocalContainer.className = "w-full h-full flex flex-col justify-center items-center gap-6 col-start-1 row-start-1 xl:col-start-1 xl:row-start-1";
	MenuContainer.appendChild(LocalContainer);

	const Txt = document.createElement("p");
	Txt.textContent = t.local;
	Txt.className = "text-3xl neon-matrix tracking-wide font-bold";``
	LocalContainer.appendChild(Txt);

	const Btn = document.createElement("button");
	Btn.className = "w-[10rem] md:w-[15rem] hover:scale-110 duration-300 transition all cursor-pointer glass-blur p-3";
	Btn.onclick = () => { mainContainer.classList.add("fade-out"); setTimeout(() => { navigateTo("/pong/local/menu"); }, 500); }
	
	const Img = document.createElement("img");
	Img.className = "w-full h-full";
	Img.src = "/icons/wifi-off.svg";
	Btn.appendChild(Img);
	
	LocalContainer.appendChild(Btn);
	}

	const HistoryContainer = document.createElement("div");{
	HistoryContainer.className = "m-auto history border-5 border-green-400 rounded-xl flex flex-col items-center text-center w-8/10 xl:w-full h-[60vh] col-span-2 row-start-2 xl:col-start-2 xl:row-start-1 xl:col-span-1";
	MenuContainer.appendChild(HistoryContainer);
	
		const HistoryTitle = document.createElement("h2");
		HistoryTitle.className = "border-green-400 w-full rounded-xl p-2 text-5xl tracking-widest neon-matrix";
		HistoryTitle.textContent = (t.history).toUpperCase();
		HistoryContainer.appendChild(HistoryTitle);
	
		const line = document.createElement("p");
		line.className = "border-3 border-green-400 w-full mb-4";
		HistoryContainer.appendChild(line);
	
		const historyList = document.createElement("ul");
		historyList.className = "text-xl text-green-300 text-center";
	
		HistoryContainer.appendChild(historyList);
	}

	const OnlineContainer = document.createElement("div");{
	OnlineContainer.className = "w-full h-full flex flex-col justify-center items-center gap-6 col-start-2 row-start-1 xl:col-start-3 xl:row-start-1";
	MenuContainer.appendChild(OnlineContainer);

	const Txt = document.createElement("p");
	Txt.textContent = t.online;
	Txt.className = "text-3xl neon-matrix tracking-wide font-bold";
	OnlineContainer.appendChild(Txt);

	const Btn = document.createElement("button");
	Btn.className = "w-[10rem] md:w-[15rem] hover:scale-110 duration-300 transition all cursor-pointer glass-blur p-3";
	Btn.onclick = () => { mainContainer.classList.add("fade-out"); setTimeout(() => { navigateTo("/pong/online/menu"); }, 500); }
	
	const Img = document.createElement("img");
	Img.className = "w-full h-full";
	Img.src = "/icons/wifi.svg";
	Btn.appendChild(Img);
	
	OnlineContainer.appendChild(Btn);
	}

	return (mainContainer);
}


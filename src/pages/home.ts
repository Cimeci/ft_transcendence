import '../style.css';
// import { translations } from '../i18n';
// import { getCurrentLang } from 'settings';
import { navigateTo } from '../routes'

export function HomePage(): HTMLElement {
	const mainContainer = document.createElement('div');
	mainContainer.className = 'pt-25 min-h-screen w-full flex items-center justify-center gap-4 bg-linear-to-t from-green-500 via-black to-green-800';
	
	const pageTitle = document.createElement('h1');
	pageTitle.className = ` fixed top-17 p-6
		text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
		from-white via-green-500 to-white 
		tracking-wide
		[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.5))_drop-shadow(0_2px_2px_rgba(0,0,0,0.3))]
		`;
		
	pageTitle.textContent = "Transcendence";
	mainContainer.appendChild(pageTitle);
	
	const LinkContainer = document.createElement("div");
	LinkContainer.className = "flex flex-col gap-15 md:flex-row lg:mt-0 items-center justify-between h-full w-8/10 xl:w-6/10 2xl:w-5/10";

	const PongLinkContainer = document.createElement("div");

	const PongImg = document.createElement("img");
	PongImg.src = "/icons/pong_icone.png"
	PongImg.className = "h-auto w-[clamp(8rem,32vw,22rem)] rounded-4xl cursor-pointer transition-all duration-300 hover:scale-110"
	PongLinkContainer.appendChild(PongImg);

	PongImg.addEventListener("click", () => {
		PongImg.classList.add("fade-out");
		setTimeout(() => { navigateTo("/pong"); }, 500);
	});

	LinkContainer.appendChild(PongLinkContainer);

	const TournamentLinkContainer = document.createElement("div");
	TournamentLinkContainer.className = "";

	const TournatmentImg = document.createElement("img");
	TournatmentImg.src = "/icons/tournament_icone.png"
	TournatmentImg.className = "h-auto w-[clamp(8rem,32vw,22rem)] rounded-4xl cursor-pointer transition-all duration-300 hover:scale-110"
	TournamentLinkContainer.appendChild(TournatmentImg);

	TournatmentImg.addEventListener("click", () => {
		navigateTo('/tournament/menu')
	});

	LinkContainer.appendChild(TournamentLinkContainer);

	mainContainer.appendChild(LinkContainer)

	
	
	return mainContainer;
}
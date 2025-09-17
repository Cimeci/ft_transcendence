import '../style.css';
// import { translations } from '../i18n';
// import { getCurrentLang } from 'settings';
import { navigateTo } from '../routes'

export function HomePage(): HTMLElement {
	const mainContainer = document.createElement('div');
	mainContainer.className = 'pt-25 min-h-screen w-full flex items-center justify-center gap-4 bg-linear-to-t from-green-500 via-black to-green-800';
	
	const pageTitle = document.createElement('h1');
	pageTitle.className = ` fixed top-20 p-6 z-1000
		text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
		from-white via-green-500 to-white 
		tracking-wide
		[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.5))_drop-shadow(0_2px_2px_rgba(0,0,0,0.3))]
		`;
		
	pageTitle.textContent = "Transcendence";
	mainContainer.appendChild(pageTitle);
	
	const LinkContainer = document.createElement("div");
	LinkContainer.className = "card-grid flex";

	const PongLinkContainer = document.createElement("div");
	PongLinkContainer.className = "";

	const PongImg = document.createElement("img");
	PongImg.src = "/icons/pong_icone.png"
	PongImg.className = "size-80 rounded-4xl cursor-pointer transition-all duration-300 hover:scale-110"
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
	TournatmentImg.className = "size-80 rounded-4xl cursor-pointer transition-all duration-300 hover:scale-110"
	TournamentLinkContainer.appendChild(TournatmentImg);

	TournatmentImg.addEventListener("click", () => {
		navigateTo('/tournament/menu')
	});

	LinkContainer.appendChild(TournamentLinkContainer);

	mainContainer.appendChild(LinkContainer)

	
	
	return mainContainer;
}
import '../style.css';
import { navigateTo } from '../routes';
import { t, createLangSection } from './settings';

export function LandingPage(): HTMLElement {
	localStorage.removeItem("jwt");

	const mainContainer = document.createElement('div');
	mainContainer.className = 'z-2000 min-h-screen w-full flex items-center justify-center gap-4 bg-[linear-gradient(rgba(10,10,10,0.3),rgba(0,0,0,0.8)),url("/bg/matrix_bg.gif")] bg-cover bg-center';
	mainContainer.tabIndex = 0;
	mainContainer.focus();

	const pageTitle = document.createElement('h1');
	pageTitle.className = ` fixed top-20 p-6 z-1000
		text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
		from-white via-green-500 to-white 
		tracking-wide
		[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.5))_drop-shadow(0_2px_2px_rgba(0,0,0,0.3))]
		`;
		
	pageTitle.textContent = "FT_TRANSCENDENCE";
	mainContainer.appendChild(pageTitle);

	const LoginContainer = document.createElement("div");
	LoginContainer.className = "flex flex-col justify-center items-center gap-4 text-center";

	const LoginBtnWrapper = document.createElement("div");
	LoginBtnWrapper.className = "relative flex items-center justify-center animated-gradient-border rounded-full p-1 mb-2";

	const LoginBtn = document.createElement("button");
	LoginBtn.className = "relative z-10 cursor-pointer transition-all duration-300 hover:scale-98 text-7xl tracking-widest text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none";
	LoginBtn.textContent = t.login;

	LoginBtn.addEventListener('click', () => {
		mainContainer.classList.add("fade-out");
		setTimeout(() => {navigateTo("/login");}, 100);
	});

	LoginBtnWrapper.appendChild(LoginBtn);
	LoginContainer.appendChild(LoginBtnWrapper);

	mainContainer.appendChild(LoginContainer);

	const translation = createLangSection();
	translation.className = "absolute top-5 right-5"
	mainContainer.appendChild(translation);

	return mainContainer;
}
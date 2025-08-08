import '../style.css';
import { navigateTo } from '../routes';
import { translations } from '../i18n';
import { getCurrentLang, createLangSection } from './settings';

export interface User {
	name: string;
}

export function LoginPage(): HTMLElement {
	const mainContainer = document.createElement('div');
	mainContainer.className = 'z-2000 min-h-screen w-full flex items-center justify-center gap-4 bg-linear-to-bl from-green-800 via-black to-green-800';
	mainContainer.tabIndex = 0;
	mainContainer.focus();

	const pageTitle = document.createElement('h1');
	pageTitle.className = `fixed top-0 p-6 z-1000
		text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
		from-white via-green-500 to-white 
		tracking-wide
		[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.5))_drop-shadow(0_2px_2px_rgba(0,0,0,0.3))]
		`;
	pageTitle.textContent = translations[getCurrentLang()].login;
	mainContainer.appendChild(pageTitle);

	const translation = createLangSection();
	translation.className = "absolute top-5 right-5";
	mainContainer.appendChild(translation);

	// Container principal du login
	const LoginContainer = document.createElement("div");
	LoginContainer.className = "flex flex-row justify-center items-center border-2 w-[60rem] p-15 gap-18 bg-black/60 rounded-xl";

	// Partie gauche : SelfLogin
	const SelfLogin = document.createElement("div");
	SelfLogin.className = "flex flex-col justify-center items-center w-1/2 gap-6";

	const InputName = document.createElement("input");
	InputName.className = "text-xl border-2 rounded px-4 py-2 w-full mb-2";
	InputName.placeholder = translations[getCurrentLang()].username;

	const InputPassword = document.createElement("input");
	InputPassword.className = "text-xl border-2 rounded px-4 py-2 w-full mb-2";
	InputPassword.placeholder = translations[getCurrentLang()].password;
	InputPassword.type = "password";

	const LoginBtn = document.createElement("button");
	LoginBtn.className = "mt-4 px-8 py-3 rounded-xl bg-green-600 text-white text-2xl hover:bg-green-700 transition-all w-full";
	LoginBtn.textContent = translations[getCurrentLang()].login;
	LoginBtn.addEventListener("click", () => {
		// Ajoute ici la logique de vérification du password
		console.log("Login:", InputName.value, InputPassword.value);
	});

	const linkRegister = document.createElement("a");
	linkRegister.className = "text-green-800";
	linkRegister.textContent = translations[getCurrentLang()].go_to_register;
	linkRegister.href = "/register";
	
	SelfLogin.appendChild(InputName);
	SelfLogin.appendChild(InputPassword);
	SelfLogin.appendChild(LoginBtn);
	SelfLogin.appendChild(linkRegister);

	// Partie droite : SocialLogin
	const SocialLogin = document.createElement("div");
	SocialLogin.className = "flex flex-col justify-center items-center w-1/2 gap-15";

	const GithubBtn = document.createElement("button");
	GithubBtn.className = "px-8 py-3 rounded-xl bg-gray-800 text-white text-2xl hover:bg-gray-900 transition-all w-full flex items-center justify-center gap-2";
	GithubBtn.innerHTML = `<img src="/github.svg" class="w-8 h-8" /> GitHub`;

	const GoogleBtn = document.createElement("button");
	GoogleBtn.className = "px-8 py-3 rounded-xl bg-white text-black text-2xl hover:bg-gray-200 transition-all w-full flex items-center justify-center gap-2";
	GoogleBtn.innerHTML = `<img src="/google.svg" class="w-8 h-8" /> Google`;

	SocialLogin.appendChild(GithubBtn);
	SocialLogin.appendChild(GoogleBtn);

	LoginContainer.appendChild(SelfLogin);
	LoginContainer.appendChild(SocialLogin);

	mainContainer.appendChild(LoginContainer);

	return mainContainer;
}
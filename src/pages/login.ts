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
	translation.className = "absolute top-0 right-0";
	mainContainer.appendChild(translation);

	// Container principal du login
	const LoginContainer = document.createElement("div");
	LoginContainer.className = "login-container flex flex-row justify-center items-center border-2 w-[60rem] p-15 gap-18 bg-black/60 rounded-xl";

	// Partie gauche : SelfLogin
	const SelfLogin = document.createElement("div");
	SelfLogin.className = "flex flex-col justify-center items-center w-1/2 gap-6";

	const InputName = document.createElement("input");
	InputName.className = "text-xl border-2 rounded px-4 py-2 w-full mb-2 duration-300 transtion-all focus:scale-103";
	InputName.placeholder = translations[getCurrentLang()].username;
	InputName.maxLength = 20;

	const InputPassword = document.createElement("input");
	InputPassword.className = "text-xl border-2 rounded px-4 py-2 w-full mb-2 duration-300 transition-all focus:scale-103 pr-12";
	InputPassword.placeholder = translations[getCurrentLang()].password;
	InputName.maxLength = 30;
	InputPassword.type = "password";

	function togglePassword(input: HTMLInputElement, icon: HTMLImageElement) {
		if (input.type === "password") {
			input.type = "text";
			icon.src = "/eye.svg";
		} else {
			input.type = "password";
			icon.src = "/eye-off.svg";
		}
	}

	function createInputWithEye(input: HTMLInputElement, eye: HTMLImageElement): HTMLDivElement {
		const wrapper = document.createElement("div");
		wrapper.className = "relative w-full";
		wrapper.appendChild(input);
		wrapper.appendChild(eye);
		return wrapper;
	}

	const EyePassword = document.createElement("img");
	EyePassword.className = "absolute right-2 top-1/6 cursor-pointer w-7 h-7 duration-500 transtion-all hover:scale-110";
	EyePassword.src = "/eye-off.svg";
	EyePassword.alt = "Show/Hide";
	EyePassword.onclick = () => togglePassword(InputPassword, EyePassword);

	const LoginBtn = document.createElement("button"); 
	LoginBtn.className = "mt-4 px-8 py-3 rounded-xl bg-green-600 text-white text-2xl duration-300 focus:scale-105 hover:scale-105 hover:bg-green-700 transition-all w-full";
	LoginBtn.textContent = translations[getCurrentLang()].login;
	LoginBtn.addEventListener("click", () => {
		if (InputName.value == "" || InputPassword.value == "" || InputPassword.value.length < 8)
		{
			if (InputName.value == "") {
				InputName.value = "";
				InputName.placeholder = translations[getCurrentLang()].empty_input;
				InputName.classList.add('placeholder:text-red-500');
				InputName.classList.add('shake');
			}
			if (InputPassword.value == "") {
				InputPassword.value = "";
				InputPassword.placeholder = translations[getCurrentLang()].empty_input;
				InputPassword.classList.add('placeholder:text-red-500');
				InputPassword.classList.add('shake');
				EyePassword.classList.add('shake');
			}

			if (InputPassword.value.length < 8 && InputPassword.value.length > 0) {
				InputPassword.value = "";
				InputPassword.placeholder = translations[getCurrentLang()].insufficient_length;
				InputPassword.classList.add('placeholder:text-red-500');
				InputPassword.classList.add('shake');
				EyePassword.classList.add('shake');
			}

			setTimeout(() => InputName.value = InputName.value, 800);
			setTimeout(() => InputName.placeholder = translations[getCurrentLang()].username, 800);
			setTimeout(() => InputName.classList.remove('placeholder:text-red-500'), 800);
			setTimeout(() => InputName.classList.remove("shake"), 800);
			
			setTimeout(() => InputPassword.value = InputPassword.value, 800);
			setTimeout(() => InputPassword.placeholder = translations[getCurrentLang()].password, 800);
			setTimeout(() => InputPassword.classList.remove('placeholder:text-red-500'), 800);
			setTimeout(() => InputPassword.classList.remove("shake"), 800);
			setTimeout(() => EyePassword.classList.remove("shake"), 800);
		}
		else {
			InputName.value = "";
			InputPassword.value = "";
			mainContainer.removeChild(translation)
			mainContainer.removeChild(LoginContainer);
			mainContainer.removeChild(pageTitle);
			console.log("Login:", InputName.value, InputPassword.value);
			const overlay = document.createElement("div");
        	overlay.className = "fixed inset-0 z-[5000] flex items-center justify-center bg-linear-to-t from-green-800 via-black to-green-800";
			overlay.style.opacity = "0";
        	overlay.style.transition = "opacity 1s ease";
        	const msg = document.createElement("h1");
        	msg.className = "text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-green-500 to-white tracking-widest neon-matrix neon-move text-center px-6";
        	msg.textContent = translations[getCurrentLang()].welcome_to_our_transcendence;
        	overlay.appendChild(msg);
        	document.body.appendChild(overlay);
        	requestAnimationFrame(() => {
        	    overlay.style.opacity = "1";
        	});
        	LoginContainer.classList.add("fade-out");
        	setTimeout(() => {
				overlay.style.opacity = "0";
				const onTransitionEnd = () => {
					overlay.removeEventListener("transitionend", onTransitionEnd);
        	        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        	    	navigateTo("/home");
				}
				overlay.addEventListener("transitionend", onTransitionEnd);
        	}, 5000);
		}
	});

	const linkRegister = document.createElement("a");
	linkRegister.className = "text-green-800 hover:text-green-700 hover:scale-103 focus:scale-103 transition-all duration-400";
	linkRegister.textContent = translations[getCurrentLang()].go_to_register;
	linkRegister.href = "/register";
	
	SelfLogin.appendChild(InputName);
	SelfLogin.appendChild(InputPassword);
	SelfLogin.appendChild(createInputWithEye(InputPassword, EyePassword));
	SelfLogin.appendChild(LoginBtn);
	SelfLogin.appendChild(linkRegister);

	// Partie droite : SocialLogin
	const SocialLogin = document.createElement("div");
	SocialLogin.className = "flex flex-col justify-center items-center w-1/2";

	const GithubBtn = document.createElement("button");
	GithubBtn.className = "px-8 py-3 rounded-xl bg-gray-800 text-white text-2xl hover:bg-gray-900 duration-300 transtion-all focus:scale-103 w-full flex items-center justify-center gap-2";
	GithubBtn.innerHTML = `<img src="/github.svg" class="w-8 h-8" /> GitHub`;

	const GoogleBtn = document.createElement("button");
	GoogleBtn.className = "mt-10 px-8 py-3 rounded-xl bg-white text-black text-2xl hover:bg-gray-200 duration-300 transtion-all focus:scale-103 w-full flex items-center justify-center gap-2";
	GoogleBtn.innerHTML = `<img src="/google.svg" class="w-8 h-8" /> Google`;

	SocialLogin.appendChild(GithubBtn);
	SocialLogin.appendChild(GoogleBtn);

	LoginContainer.appendChild(SelfLogin);
	LoginContainer.appendChild(SocialLogin);

	mainContainer.appendChild(LoginContainer);

	return mainContainer;
}
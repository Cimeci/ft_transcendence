import '../style.css';
import { navigateTo } from '../routes';
import { translations } from '../i18n';
import { getCurrentLang, createLangSection } from './settings';
// import { Inventory } from './inventory';

export interface User {
    name: string;
    password: string;
    // inventory?: Inventory;
}

export function RegisterPage(): HTMLElement {
	const mainContainer = document.createElement('div');
	mainContainer.className = 'z-2000 min-h-screen w-full flex items-center justify-center gap-4 bg-linear-to-bl from-green-800 via-black to-green-800';
	mainContainer.tabIndex = 0;
	mainContainer.focus();

	const pageTitle = document.createElement('h1');
	pageTitle.className = ` fixed top-0 p-6 z-1000
		text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
		from-white via-green-500 to-white 
		tracking-wide
		[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.5))_drop-shadow(0_2px_2px_rgba(0,0,0,0.3))]
		`;
		
	pageTitle.textContent = translations[getCurrentLang()].register;
	mainContainer.appendChild(pageTitle);
	
	const translation = createLangSection();
	translation.className = "absolute top-5 right-5"
	mainContainer.appendChild(translation);

	const newuser: User = {name: "", password: ""};

	const LoginContainer = document.createElement("div");
	LoginContainer.className = "flex flex-col justify-center items-center border-2 w-[35rem] p-15 gap-8 bg-black/60 rounded-xl";

	const InputName = document.createElement("input");
	InputName.className = "text-xl border-2 rounded px-4 py-2 w-full mb-2";
	InputName.placeholder = translations[getCurrentLang()].username;
	InputName.addEventListener("input", () => {
		newuser.name = InputName.value;
	});
	LoginContainer.appendChild(InputName);

	function togglePassword(input: HTMLInputElement, icon: HTMLImageElement) {
		if (input.type === "password") {
			input.type = "text";
			icon.src = "/open-eye.png"; // chemin vers l'icône "voir"
		} else {
			input.type = "password";
			icon.src = "/close-eye.png"; // chemin vers l'icône "masquer"
		}
	}

	function createInputWithEye(input: HTMLInputElement, eye: HTMLImageElement): HTMLDivElement {
		const wrapper = document.createElement("div");
		wrapper.className = "relative w-full mb-2";
		wrapper.appendChild(input);
		wrapper.appendChild(eye);
		return wrapper;
	}

	// Input Password
	const InputPassword = document.createElement("input");
	InputPassword.className = "text-xl border-2 rounded px-4 py-2 w-full";
	InputPassword.placeholder = translations[getCurrentLang()].password;
	InputPassword.type = "password";
	InputPassword.addEventListener("input", () => {
		newuser.password = InputPassword.value;
	});
	const EyePassword = document.createElement("img");
	EyePassword.className = "absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer w-10 h-10";
	EyePassword.src = "/close-eye.png";
	EyePassword.alt = "Afficher/Masquer";
	EyePassword.onclick = () => togglePassword(InputPassword, EyePassword);
	LoginContainer.appendChild(createInputWithEye(InputPassword, EyePassword));

	// Input Confirm Password
	const InputConfirmPassword = document.createElement("input");
	InputConfirmPassword.className = "text-xl border-2 rounded px-4 py-2 w-full";
	InputConfirmPassword.placeholder = translations[getCurrentLang()].confirm_password;
	InputConfirmPassword.type = "password";
	let confirmPassword: string;
	InputConfirmPassword.addEventListener("input", () => {
		confirmPassword = InputConfirmPassword.value;
	});
	const EyeConfirm = document.createElement("img");
	EyeConfirm.className = "absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer w-10 h-10";
	EyeConfirm.src = "/close-eye.png";
	EyeConfirm.alt = "Afficher/Masquer";
	EyeConfirm.onclick = () => togglePassword(InputConfirmPassword, EyeConfirm);
	LoginContainer.appendChild(createInputWithEye(InputConfirmPassword, EyeConfirm));

	// Register Button
	const RegisterBtn = document.createElement("button");
	RegisterBtn.className = "mt-4 px-8 py-3 rounded-xl bg-green-600 text-white text-2xl hover:bg-green-700 transition-all w-full";
	RegisterBtn.textContent = "Register";
	RegisterBtn.addEventListener("click", () => {
		if (newuser.name == "" || newuser.password == "" || confirmPassword != newuser.password) {
			RegisterBtn.classList.add("shake");
			setTimeout(() => RegisterBtn.classList.remove("shake"), 400);
		} else {
			InputName.value = "";
			InputPassword.value = "";
			InputConfirmPassword.value = "";
			console.log("Register:", newuser); //! ADD TO THE DATA BASE //
		}
	});
	LoginContainer.appendChild(RegisterBtn);

	const linkLogin = document.createElement("a");
	linkLogin.className = "text-green-800";
	linkLogin.textContent = translations[getCurrentLang()].back_to_login;
	linkLogin.href = "/login";
	LoginContainer.appendChild(linkLogin);

	mainContainer.appendChild(LoginContainer);

	return mainContainer;
}
import '../style.css';
import { navigateTo } from '../routes';
import { translations } from '../i18n';
import { getCurrentLang, createLangSection } from './settings';
// import { Inventory } from './inventory';

export interface User {
    name: string;
    password: string;
	confirm_password: string; 
    // inventory?: Inventory;
}

export function togglePassword(input: HTMLInputElement, icon: HTMLImageElement) {
	if (input.type === "password") {
		input.type = "text";
		icon.src = "/icons/eye.svg";
	} else {
		input.type = "password";
		icon.src = "/icons/eye-off.svg";
	}
}

export function createInputWithEye(input: HTMLInputElement, eye: HTMLImageElement): HTMLDivElement {
	const wrapper = document.createElement("div");
	wrapper.className = "relative w-full mb-2";
	wrapper.appendChild(input);
	wrapper.appendChild(eye);
	return wrapper;
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
	translation.className = "absolute top-0 right-0"
	mainContainer.appendChild(translation);

	const newuser: User = {name: "", password: "", confirm_password: ""};

	const RegisterContainer = document.createElement("div");
	RegisterContainer.className = "flex flex-col justify-center items-center border-2 w-[35rem] p-15 gap-8 bg-black/60 rounded-xl";

	const InputName = document.createElement("input");
	InputName.className = "text-xl border-2 rounded px-4 py-2 w-full mb-2 duration-300 transtion-all focus:scale-103";
	InputName.placeholder = translations[getCurrentLang()].username;
	InputName.maxLength = 20;
	InputName.focus();
	InputName.addEventListener("input", () => {
		newuser.name = InputName.value;
	});
	RegisterContainer.appendChild(InputName);

	// Input Password
	const InputPassword = document.createElement("input");
	InputPassword.className = "text-xl border-2 rounded px-4 py-2 w-full duration-300 transtion-all focus:scale-103";
	InputPassword.placeholder = translations[getCurrentLang()].password;
	InputPassword.type = "password";
	InputPassword.maxLength = 30;
	InputPassword.focus();
	InputPassword.addEventListener("input", () => {
		newuser.password = InputPassword.value;
	});
	const EyePassword = document.createElement("img");
	EyePassword.className = "absolute right-2 top-1/5 cursor-pointer w-7 h-7 duration-500 transtion-all hover:scale-110";
	EyePassword.src = "/icons/eye-off.svg";
	EyePassword.alt = "Show/Hide";
	EyePassword.onclick = () => togglePassword(InputPassword, EyePassword);
	RegisterContainer.appendChild(createInputWithEye(InputPassword, EyePassword));

	// Input Confirm Password
	const InputConfirmPassword = document.createElement("input");
	InputConfirmPassword.className = "text-xl border-2 rounded px-4 py-2 w-full duration-300 transtion-all focus:scale-103";
	InputConfirmPassword.placeholder = translations[getCurrentLang()].confirm_password;
	InputConfirmPassword.type = "password";
	InputConfirmPassword.maxLength = 30;
	InputConfirmPassword.focus();
	InputConfirmPassword.addEventListener("input", () => {
		newuser.confirm_password = InputConfirmPassword.value;
	});
	const EyeConfirm = document.createElement("img");
	EyeConfirm.className = "absolute right-2 top-1/5 cursor-pointer w-7 h-7 duration-500 transtion-all hover:scale-110";
	EyeConfirm.src = "/icons/eye-off.svg";
	EyeConfirm.alt = "Show/Hide";
	EyeConfirm.onclick = () => togglePassword(InputPassword, EyeConfirm);
	RegisterContainer.appendChild(createInputWithEye(InputConfirmPassword, EyeConfirm));

	// Register Button
	const RegisterBtn = document.createElement("button");
	RegisterBtn.className = "mt-4 px-8 py-3 rounded-xl bg-green-600 text-white text-2xl duration-300 focus:scale-105 hover:scale-105 hover:bg-green-700 transition-all w-full";
	RegisterBtn.textContent = translations[getCurrentLang()].register;
	RegisterBtn.addEventListener("click", () => {
		if (newuser.password.length < 8 || newuser.confirm_password.length < 8 || newuser.name == "" || newuser.confirm_password != newuser.password) {

			if (newuser.name == "") {
				InputName.value = "";
				InputName.placeholder = translations[getCurrentLang()].empty_input;
				InputName.classList.add('placeholder:text-red-500');
				InputName.classList.add('shake');
			}
			if (newuser.password == "") {
				InputPassword.value = "";
				InputPassword.placeholder = translations[getCurrentLang()].empty_input;
				InputPassword.classList.add('placeholder:text-red-500');
				InputPassword.classList.add('shake');
				EyePassword.classList.add('shake');
			}
			if (newuser.confirm_password == "") {
				InputConfirmPassword.value = "";
				InputConfirmPassword.placeholder = translations[getCurrentLang()].empty_input;
				InputConfirmPassword.classList.add('placeholder:text-red-500');
				InputConfirmPassword.classList.add('shake');
				EyeConfirm.classList.add('shake');
			}

			if (newuser.password.length < 8 && newuser.password.length > 0) {
				InputPassword.value = "";
				InputPassword.placeholder = translations[getCurrentLang()].insufficient_length;
				InputPassword.classList.add('placeholder:text-red-500');
				InputPassword.classList.add('shake');
				EyePassword.classList.add('shake');
			}
			if (newuser.confirm_password.length < 8 && newuser.confirm_password.length > 0) {
				InputConfirmPassword.value = "";
				InputConfirmPassword.placeholder = translations[getCurrentLang()].insufficient_length;
				InputConfirmPassword.classList.add('placeholder:text-red-500');
				InputConfirmPassword.classList.add('shake');
				EyeConfirm.classList.add('shake');
			}

			if (newuser.confirm_password != newuser.password)
			{
				InputPassword.value = "";
				InputPassword.placeholder = translations[getCurrentLang()].not_same_input;
				InputPassword.classList.add('placeholder:text-red-500');
				InputPassword.classList.add('shake');
				EyePassword.classList.add('shake');

				InputConfirmPassword.value = "";
				InputConfirmPassword.placeholder = translations[getCurrentLang()].not_same_input;
				InputConfirmPassword.classList.add('placeholder:text-red-500');
				InputConfirmPassword.classList.add('shake');
				EyeConfirm.classList.add('shake');
			}

			setTimeout(() => InputName.value = newuser.name, 800);
			setTimeout(() => InputName.placeholder = translations[getCurrentLang()].username, 800);
			setTimeout(() => InputName.classList.remove('placeholder:text-red-500'), 800);
			setTimeout(() => InputName.classList.remove("shake"), 800);
			
			setTimeout(() => InputPassword.value = newuser.password, 800);
			setTimeout(() => InputPassword.placeholder = translations[getCurrentLang()].password, 800);
			setTimeout(() => InputPassword.classList.remove('placeholder:text-red-500'), 800);
			setTimeout(() => InputPassword.classList.remove("shake"), 800);
			setTimeout(() => EyePassword.classList.remove("shake"), 800);

			setTimeout(() => InputConfirmPassword.value = newuser.confirm_password, 800);
			setTimeout(() => InputConfirmPassword.placeholder = translations[getCurrentLang()].confirm_password, 800);
			setTimeout(() => InputConfirmPassword.classList.remove('placeholder:text-red-500'), 800);
			setTimeout(() => InputConfirmPassword.classList.remove("shake"), 800);
			setTimeout(() => EyeConfirm.classList.remove("shake"), 800);

		} else {
			InputName.value = "";
			InputPassword.value = "";
			InputConfirmPassword.value = "";
			mainContainer.removeChild(translation)
			mainContainer.removeChild(RegisterContainer);
			mainContainer.removeChild(pageTitle);
			console.log("Register:", newuser); //! ADD TO THE DATA BASE //
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

            RegisterContainer.classList.add("fade-out");

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
	RegisterContainer.appendChild(RegisterBtn);

	const linkLogin = document.createElement("a");
	linkLogin.className = "text-green-800 hover:text-green-700 focus:scale-103 hover:scale-103 transition-all duration-400";
	linkLogin.textContent = translations[getCurrentLang()].back_to_login;
	linkLogin.href = "/login";
	RegisterContainer.appendChild(linkLogin);

	mainContainer.appendChild(RegisterContainer);

	return mainContainer;
}
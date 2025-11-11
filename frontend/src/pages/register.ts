import '../style.css';
import { navigateTo } from '../routes';
import { t, createLangSection } from './settings';
import { ensureUser } from '../linkUser';

export interface User {
    name: string;
	email:string;
    password: string;
	confirm_password: string; 
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

async function register(newuser: User, InputName: HTMLInputElement, InputEmail: HTMLInputElement, InputPassword: HTMLInputElement, InputConfirmPassword: HTMLInputElement) {
	try {
		const resp = await fetch("/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username: newuser.name.trim() ,email: newuser.email.trim(), password: newuser.password.trim() })
		});
		const data = await resp.json();
		if (!resp.ok) throw new Error(data?.error || "Register failed");
		const jwt = data.token || data.jwtToken;
		if (jwt) {
			localStorage.setItem('jwt', jwt);
			await ensureUser(true);
		}
		console.log("jwt:", jwt);
		navigateTo("/home");
	} catch (e: any) {
		if (e.message.includes("username") || e.message.includes("Username"))
		{
			InputName.value = "";
			InputName.placeholder = e.message || "Register failed";
			InputName.classList.add('placeholder:text-lg','placeholder:text-red-500','shake');
		}
		else if (e.message.includes("email") || e.message.includes("Email"))
		{
			InputEmail.value = "";
			InputEmail.placeholder = e.message || "Register failed";
			InputEmail.classList.add('placeholder:text-lg','placeholder:text-red-500','shake');
		}
		else if (e.message.includes("password") || e.message.includes("Password"))
		{
			InputPassword.value = "";
			InputPassword.placeholder = e.message || "Register failed";
			InputPassword.classList.add('placeholder:text-lg','placeholder:text-red-500','shake');
			InputConfirmPassword.value = "";
			InputConfirmPassword.placeholder = e.message || "Register failed";
			InputConfirmPassword.classList.add('placeholder:text-lg','placeholder:text-red-500','shake');
		}
		setTimeout(() => {
			InputName.placeholder = t.username;
			InputName.classList.remove('placeholder:text-lg','placeholder:text-red-500','shake');
			InputEmail.placeholder = t.email;
			InputEmail.classList.remove('placeholder:text-lg','placeholder:text-red-500','shake');
			InputPassword.placeholder = t.password;
			InputPassword.classList.remove('placeholder:text-lg','placeholder:text-red-500','shake');
			InputConfirmPassword.placeholder = t.confirm_password;
			InputConfirmPassword.classList.remove('placeholder:text-lg','placeholder:text-red-500','shake');
		}, 800);
	}
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
		
	pageTitle.textContent = t.register;
	mainContainer.appendChild(pageTitle);
	
	const translation = createLangSection();
	translation.className = "absolute top-0 right-0"
	mainContainer.appendChild(translation);

	const newuser: User = {name: "Default", email: "", password: "", confirm_password: ""};

	const RegisterContainer = document.createElement("div");
	RegisterContainer.className = "flex flex-col justify-center items-center border-2 w-[35rem] p-15 gap-4 bg-black/60 rounded-xl";

	document.addEventListener('keydown', (event: KeyboardEvent) =>{
    	if (document.activeElement !== translation
			&& document.activeElement !== InputName
			&& document.activeElement !== InputEmail
			&& document.activeElement !== InputPassword
			&& document.activeElement !== InputConfirmPassword
			&& document.activeElement !== linkLogin
			&& document.activeElement !== RegisterBtn
			&& event.key !== 'Tab')
        	InputName.focus();
	})

	const InputName = document.createElement("input");
	InputName.className = "text-xl border-2 rounded px-4 py-2 w-full mb-2 duration-300 transition-all focus:scale-103";
	InputName.placeholder = t.username;
	InputName.maxLength = 20;
	InputName.addEventListener("input", () => {
		newuser.name = InputName.value;
	});
	InputName.addEventListener('keydown', (event: KeyboardEvent) => {
  		if (event.key === 'Enter') { event.preventDefault(); InputEmail.focus(); }
	})
	RegisterContainer.appendChild(InputName);

	const InputEmail = document.createElement("input");
	InputEmail.className = "text-xl border-2 rounded px-4 py-2 w-full mb-2 duration-300 transtion-all focus:scale-103";
	InputEmail.placeholder = t.email;
	InputEmail.addEventListener("input", () => {
		newuser.email = InputEmail.value;
	});
	InputEmail.addEventListener('keydown', (event: KeyboardEvent) => {
  		if (event.key === 'Enter') { event.preventDefault(); InputPassword.focus(); }
	})
	RegisterContainer.appendChild(InputEmail);

	const InputPassword = document.createElement("input");
	InputPassword.className = "text-xl border-2 rounded px-4 py-2 w-full duration-300 transtion-all focus:scale-103";
	InputPassword.placeholder = t.password;
	InputPassword.type = "password";
	InputPassword.maxLength = 30;
	InputPassword.addEventListener("input", () => {
		newuser.password = InputPassword.value;
	});
	InputPassword.addEventListener('keydown', (event: KeyboardEvent) => {
  		if (event.key === 'Enter') { event.preventDefault(); InputConfirmPassword.focus(); }
	})

	const EyePassword = document.createElement("img");
	EyePassword.className = "absolute right-2 top-1/5 cursor-pointer w-7 h-7 duration-500 transtion-all hover:scale-110";
	EyePassword.src = "/icons/eye-off.svg";
	EyePassword.alt = "Show/Hide";
	EyePassword.onclick = () => togglePassword(InputPassword, EyePassword);
	RegisterContainer.appendChild(createInputWithEye(InputPassword, EyePassword));

	const InputConfirmPassword = document.createElement("input");
	InputConfirmPassword.className = "text-xl border-2 rounded px-4 py-2 w-full duration-300 transtion-all focus:scale-103";
	InputConfirmPassword.placeholder = t.confirm_password;
	InputConfirmPassword.type = "password";
	InputConfirmPassword.maxLength = 30;
	InputConfirmPassword.addEventListener("input", () => {
		newuser.confirm_password = InputConfirmPassword.value;
	});
	InputConfirmPassword.addEventListener('keydown', async (event: KeyboardEvent) => {
  		if (event.key === 'Enter') {
			event.preventDefault();
			await register(newuser, InputName, InputEmail, InputPassword, InputConfirmPassword);
		}
	})

	const EyeConfirm = document.createElement("img");
	EyeConfirm.className = "absolute right-2 top-1/5 cursor-pointer w-7 h-7 duration-500 transtion-all hover:scale-110";
	EyeConfirm.src = "/icons/eye-off.svg";
	EyeConfirm.alt = "Show/Hide";
	EyeConfirm.onclick = () => togglePassword(InputConfirmPassword, EyeConfirm);
	RegisterContainer.appendChild(createInputWithEye(InputConfirmPassword, EyeConfirm));

	const infoContainer = document.createElement("div");
	infoContainer.className = "flex flex-col gap-2 p-2 text-xs text-white/30";
	RegisterContainer.appendChild(infoContainer);

	const usernameInfo = document.createElement("p");
	usernameInfo.className = "text-xs text-white/30";
	usernameInfo.textContent = t.username_length;
	infoContainer.appendChild(usernameInfo);

	const passwordInfo = document.createElement("p");
	passwordInfo.className = "text-xs text-white/30";
	passwordInfo.textContent = t.password_must;
	infoContainer.appendChild(passwordInfo);

	// Register Button
	const RegisterBtn = document.createElement("button");
	RegisterBtn.className = "mt-4 px-8 py-3 rounded-xl bg-green-600 text-white text-2xl duration-300 focus:scale-105 hover:scale-105 hover:bg-green-700 transition-all w-full";
	RegisterBtn.textContent = t.register;
	RegisterBtn.addEventListener("click", async () => {
		await register(newuser, InputName, InputEmail, InputPassword, InputConfirmPassword);
	});
	RegisterContainer.appendChild(RegisterBtn);

	const linkLogin = document.createElement("a");
	linkLogin.className = "text-green-800 hover:text-green-700 focus:scale-103 hover:scale-103 transition-all duration-400";
	linkLogin.textContent = t.back_to_login;
	linkLogin.href = "/login";
	RegisterContainer.appendChild(linkLogin);

	mainContainer.appendChild(RegisterContainer);

	return mainContainer;
}
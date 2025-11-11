import '../style.css';
import { navigateTo } from '../routes';
import { t, createLangSection } from './settings';
import { ensureUser } from '../linkUser';
import { getUser } from '../linkUser';

export function TwoFAPage(): HTMLElement {
	const root = document.createElement('div');
	root.className = 'z-2000 min-h-screen w-full flex items-center justify-center bg-linear-to-bl from-green-800 via-black to-green-800';

	const container = document.createElement('div');
	container.className = 'flex flex-col items-center justify-center border-2 w-[30rem] p-12 gap-8 bg-black/60 rounded-xl';

	const title = document.createElement('h2');
	title.className = 'text-4xl font-bold text-green-400 text-center';
	title.textContent = t.twoFA;
	container.appendChild(title);

	const desc = document.createElement('p');
	desc.className = 'text-center text-white/80 text-lg';
	desc.textContent = t.twoFA_code_sent;
	container.appendChild(desc);

	const codeInput = document.createElement('input');
	codeInput.className = 'text-xl border-2 border-green-500 rounded px-4 py-3 w-full duration-300 transition-all focus:scale-103 focus:border-green-400 text-center tracking-widest';
	codeInput.placeholder = t.enter_code;
	codeInput.type = 'text';
	codeInput.maxLength = 6;
	codeInput.inputMode = 'numeric';
	codeInput.focus();
	container.appendChild(codeInput);

	const buttonContainer = document.createElement('div');
	buttonContainer.className = 'flex gap-4 w-full';

	// Bouton Vérifier
	const verifyBtn = document.createElement('button');
	verifyBtn.className = 'flex-1 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-lg font-semibold duration-300 transition-all hover:scale-105 focus:scale-105';
	verifyBtn.textContent = t.verify;
	verifyBtn.addEventListener('click', async () => {
		await verify2FA(codeInput.value, root);
	});

	const backBtn = document.createElement('button');
	backBtn.className = 'flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-lg font-semibold duration-300 transition-all hover:scale-105 focus:scale-105';
	backBtn.textContent = t.back;
	backBtn.addEventListener('click', () => {
		localStorage.removeItem('jwt');
		navigateTo('/login');
	});

	codeInput.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && codeInput.value.length === 6) {
			verify2FA(codeInput.value, root);
		}
	});

	// Message d'erreur
	const errorMsg = document.createElement('p');
	errorMsg.className = 'text-red-400 text-center text-sm hidden';

	buttonContainer.appendChild(verifyBtn);
	buttonContainer.appendChild(backBtn);
	container.appendChild(errorMsg);
	container.appendChild(buttonContainer);

	root.appendChild(container);

	// Stocker la référence pour les erreurs
	(root as any).codeInput = codeInput;
	(root as any).errorMsg = errorMsg;

	return root;
}

async function verify2FA(code: string, root: HTMLElement) {
	if (!code || code.length !== 6) {
		const errorMsg = (root as any).errorMsg;
		errorMsg.textContent = 'Code invalide (6 chiffres requis)';
		errorMsg.classList.remove('hidden');
		setTimeout(() => errorMsg.classList.add('hidden'), 3000);
		return;
	}

	try {
		const token = localStorage.getItem('jwt');
		if (!token) {
			throw new Error('Token not found');
		}

		const response = await fetch('/auth/verify-2fa', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ code })
		});

		const data = await response.json();

		if (!response.ok) {
			const errorMsg = (root as any).errorMsg;
			errorMsg.textContent = data.error || t.twoFA_code_invalid;
			errorMsg.classList.remove('hidden');
			(root as any).codeInput.value = '';
			return;
		}

		await ensureUser(true);
		navigateTo('/home');

	} catch (error: any) {
		const errorMsg = (root as any).errorMsg;
		errorMsg.textContent = error.message || 'Erreur de vérification';
		errorMsg.classList.remove('hidden');
		console.error('2FA verification error:', error);
	}
}

async function login(InputMail: HTMLInputElement, InputPassword: HTMLInputElement, EyePassword: HTMLImageElement) {
	if (InputMail.value == '' || InputPassword.value == '' || InputPassword.value.length < 8) {
		if (InputMail.value == '') {
			InputMail.value = '';
			InputMail.placeholder = t.empty_input;
			InputMail.classList.add('placeholder:text-red-500');
			InputMail.classList.add('shake');
		}

		if (InputPassword.value == '') {
			InputPassword.value = '';
			InputPassword.placeholder = t.empty_input;
			InputPassword.classList.add('placeholder:text-red-500');
			InputPassword.classList.add('shake');
			EyePassword.classList.add('shake');
		}

		if (InputPassword.value.length < 8 && InputPassword.value.length > 0) {
			InputPassword.value = '';
			InputPassword.placeholder = t.insufficient_length;
			InputPassword.classList.add('placeholder:text-red-500');
			InputPassword.classList.add('shake');
			EyePassword.classList.add('shake');
		}

		setTimeout(() => InputMail.value = InputMail.value, 800);
		setTimeout(() => InputMail.placeholder = t.username, 800);
		setTimeout(() => InputMail.classList.remove('placeholder:text-red-500'), 800);
		setTimeout(() => InputMail.classList.remove('shake'), 800);
		
		setTimeout(() => InputPassword.value = InputPassword.value, 800);
		setTimeout(() => InputPassword.placeholder = t.password, 800);
		setTimeout(() => InputPassword.classList.remove('placeholder:text-red-500'), 800);
		setTimeout(() => InputPassword.classList.remove('shake'), 800);
		setTimeout(() => EyePassword.classList.remove('shake'), 800);

	} else {
		try {
			const resp = await fetch('/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: InputMail.value.trim(), password: InputPassword.value })
			});
			const data = await resp.json();
			if (!resp.ok) throw new Error(data?.error || 'Login failed');
			localStorage.setItem('jwt', data.jwtToken);

			if (data.requires2FA) {
				const app = document.getElementById('app');
				if (app) {
					app.innerHTML = '';
					app.appendChild(TwoFAPage());
				}
			} else {
				navigateTo('/home');
			}
		} catch (e: any) {
			InputPassword.value = '';
			InputPassword.placeholder = e.message || 'Login failed';
			InputPassword.classList.add('placeholder:text-red-500','shake');
			setTimeout(() => {
				InputPassword.placeholder = t.password;
				InputPassword.classList.remove('placeholder:text-red-500','shake');
			}, 800);
		}
	}
}

export function OAuthCallbackPage(): HTMLElement {
	const root = document.createElement('div');
	root.className = 'min-h-screen flex items-center justify-center text-white';
	root.textContent = 'Connexion...';

	const params = new URLSearchParams(location.search);
	const token = params.get('token');
	const requires2FA = params.get('requires2FA') === 'true';
	const error = params.get('error');

	const showError = (msg: string) => {
		root.innerHTML = '';

		const wrap = document.createElement('div');
		wrap.className = 'flex flex-col items-center gap-3';

		const p = document.createElement('p');
		p.textContent = msg;

		const back = document.createElement('a');
		back.href = '/login';
		back.textContent = t.back_to_login;
		back.setAttribute('data-link', '');
		back.className = 'text-green-400 hover:text-green-300 underline';

		wrap.appendChild(p);
		wrap.appendChild(back);
		root.appendChild(wrap);
	};

	if (error) {
		const msg = error === 'no_email_from_github'
			? 'GitHub did not provide an email for this account.'
			: error === '2fa_email_failed'
			? 'Failed to send 2FA code. Please try again.'
			: 'OAuth error.';
		showError(msg);
		return root;
	}

	if (token) {
		localStorage.setItem('jwt', token);

		if (requires2FA) {
			root.innerHTML = '';
			root.appendChild(TwoFAPage());
			return root;
		}

		ensureUser(true)
			.then(() => {
				const user = getUser();
				if (user && user.is_a2f === 1) {
					const app = document.getElementById('app');
					if (app) {
						app.innerHTML = '';
						app.appendChild(TwoFAPage());
					}
				} else {
					// 2FA désactivé → aller à home
					navigateTo('/home');
				}
			})
			.catch(() => {
				showError('Error: unable to fetch profile');
			});
	} else {
		showError('Error: missing token');
		console.error('OAuth callback: token introuvable dans URL');
	}
	return root;
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
	pageTitle.textContent = t.login;
	mainContainer.appendChild(pageTitle);

	const translation = createLangSection();
	translation.className = 'absolute top-0 right-0';
	mainContainer.appendChild(translation);

	const LoginContainer = document.createElement('div');
	LoginContainer.className = 'login-container flex flex-row justify-center items-center border-2 w-[60rem] p-15 gap-18 bg-black/60 rounded-xl';

	//LEFT
	const SelfLogin = document.createElement('div');
	SelfLogin.className = 'flex flex-col justify-center items-center w-1/2 gap-6';

	document.addEventListener('keydown', (event: KeyboardEvent) => {
		if (document.activeElement !== translation
			&& document.activeElement !== InputMail
			&& document.activeElement !== InputPassword
			&& document.activeElement !== LoginBtn
			&& document.activeElement !== linkRegister
			&& document.activeElement !== GithubBtn
			&& document.activeElement !== GoogleBtn
			&& event.key !== 'Tab')
			InputMail.focus();
	})

	const InputMail = document.createElement('input');
	InputMail.className = 'text-xl border-2 rounded px-4 py-2 w-full mb-2 duration-300 transtion-all focus:scale-103';
	InputMail.placeholder = t.email;
	InputMail.addEventListener('keydown', (event :KeyboardEvent) => {
		if (event.key === 'Enter') { InputPassword.focus(); }
	})

	const InputPassword = document.createElement('input');
	InputPassword.className = 'text-xl border-2 rounded px-4 py-2 w-full mb-2 duration-300 transition-all focus:scale-103 pr-12';
	InputPassword.placeholder = t.password;
	InputPassword.maxLength = 30;
	InputPassword.type = 'password';
	InputPassword.addEventListener('keydown', (event :KeyboardEvent) => {
		if (event.key === 'Enter')
			login(InputMail, InputPassword, EyePassword);
	})

	function togglePassword(input: HTMLInputElement, icon: HTMLImageElement) {
		if (input.type === 'password') {
			input.type = 'text';
			icon.src = '/icons/eye.svg';
		} else {
			input.type = 'password';
			icon.src = '/icons/eye-off.svg';
		}
	}

	function createInputWithEye(input: HTMLInputElement, eye: HTMLImageElement): HTMLDivElement {
		const wrapper = document.createElement('div');
		wrapper.className = 'relative w-full';
		wrapper.appendChild(input);
		wrapper.appendChild(eye);
		return wrapper;
	}

	const EyePassword = document.createElement('img');
	EyePassword.className = 'absolute right-2 top-1/6 cursor-pointer w-7 h-7 duration-500 transtion-all hover:scale-110';
	EyePassword.src = '/icons/eye-off.svg';
	EyePassword.alt = 'Show/Hide';
	EyePassword.onclick = () => togglePassword(InputPassword, EyePassword);

	const LoginBtn = document.createElement('button'); 
	LoginBtn.className = 'mt-4 px-8 py-3 rounded-xl bg-green-600 text-white text-2xl duration-300 focus:scale-105 hover:scale-105 hover:bg-green-700 transition-all w-full';
	LoginBtn.textContent = t.login;
	LoginBtn.addEventListener('click', async () => {
		login(InputMail, InputPassword, EyePassword);
	});

	const linkRegister = document.createElement('a');
	linkRegister.className = 'text-green-800 hover:text-green-700 hover:scale-103 focus:scale-103 transition-all duration-400';
	linkRegister.textContent = t.go_to_register;
	linkRegister.href = '/register';
	
	SelfLogin.appendChild(InputMail);
	SelfLogin.appendChild(InputPassword);
	SelfLogin.appendChild(createInputWithEye(InputPassword, EyePassword));
	SelfLogin.appendChild(LoginBtn);
	SelfLogin.appendChild(linkRegister);

	// RIGHT
	const SocialLogin = document.createElement('div');
	SocialLogin.className = 'flex flex-col justify-center items-center w-1/2';

	const GithubBtn = document.createElement('button');
	GithubBtn.className = 'px-8 py-3 rounded-xl bg-gray-800 text-white text-2xl hover:bg-gray-900 duration-300 transtion-all focus:scale-103 w-full flex items-center justify-center gap-2';
	GithubBtn.innerHTML = `<img src="/icons/github.svg" class="w-8 h-8" /> GitHub`;
	GithubBtn.addEventListener(('click'), async () => {
		window.location.href = 'https://localhost:4443/auth/github/login';
	})

	const GoogleBtn = document.createElement('button');
	GoogleBtn.className = 'mt-10 px-8 py-3 rounded-xl bg-white text-black text-2xl hover:bg-gray-200 duration-300 transtion-all focus:scale-103 w-full flex items-center justify-center gap-2';
	GoogleBtn.innerHTML = `<img src="/icons/google.svg" class="w-8 h-8" /> Google`;
	GoogleBtn.addEventListener(('click'), async () => {
		window.location.href = 'https://localhost:4443/auth/google/login';
	})

	SocialLogin.appendChild(GithubBtn);
	SocialLogin.appendChild(GoogleBtn);

	LoginContainer.appendChild(SelfLogin);
	LoginContainer.appendChild(SocialLogin);

	mainContainer.appendChild(LoginContainer);

	return mainContainer;
}

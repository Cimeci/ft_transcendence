import { translations } from '../i18n';

export function getCurrentLang(): 'fr' | 'en' | 'es' {
	return (localStorage.getItem('lang') as 'fr' | 'en' | 'es') || 'en';
}

function setLanguage(lang: string) {
	localStorage.setItem('lang', lang);
	if (typeof window.renderPage === 'function') window.renderPage();
}

export function createLangSection(): HTMLElement {
	const langDropdownContainer = document.createElement('div');
	langDropdownContainer.style.position = 'relative';

	const langButton = document.createElement('button');
	langButton.type = 'button';
	langButton.className = 'p-1 bg-transparent border-none cursor-pointer flex items-center justify-center';

	const imgBtn = document.createElement("img");
	imgBtn.src = "/icons/translate.svg";
	imgBtn.alt = "Lang";
	imgBtn.className = "w-[5rem] focus:scale-110 hover:scale-110 duration-300 transition-all";
	langButton.appendChild(imgBtn);

	const langMenu = document.createElement('ul');
	langMenu.className = 'mr-2 gap-5 w-[2rem] flex-1 bg-[#242424] rounded-xl shadow-lg z-50 text-white border border-green-700';
	langMenu.style.display = 'none';
	langMenu.style.listStyle = 'none';
	langMenu.style.padding = '0';
	langMenu.style.opacity = '0';
	langMenu.style.transform = 'scale(0.92) translateY(-6px)';
	langMenu.style.transformOrigin = 'top';
	langMenu.style.transition = 'opacity 180ms ease, transform 180ms ease';

	const languages = [
		{ code: 'fr', label: 'Français' },
		{ code: 'en', label: 'English' },
		{ code: 'es', label: 'Español' }
	];

	languages.forEach(lang => {
		const li = document.createElement('li');
		li.className = 'px-4 py-2 rounded-xl duration-300 hover:scale-105 transition-all hover:bg-green-700 cursor-pointer h-1/3 flex items-center';
		li.textContent = lang.label;
		li.onclick = () => {
			setLanguage(lang.code);
			langMenu.style.display = 'none';
		};
		langMenu.appendChild(li);
	});

	function openMenu() {
		if (langMenu.style.display === 'block') return;
		langMenu.style.display = 'block';
		requestAnimationFrame(() => {
			langMenu.style.opacity = '1';
			langMenu.style.transform = 'scale(1) translateY(0)';
		});
	}

	function closeMenu() {
		if (langMenu.style.display === 'none') return;
		langMenu.style.opacity = '0';
		langMenu.style.transform = 'scale(0.95) translateY(-4px)';
		const onEnd = () => {
			langMenu.removeEventListener('transitionend', onEnd);
			if (langMenu.style.opacity === '0') {
				langMenu.style.display = 'none';
			}
		};
		langMenu.addEventListener('transitionend', onEnd);
	}

	langButton.onclick = (e) => {
		e.stopPropagation();
		if (langMenu.style.display === 'none') openMenu(); else closeMenu();
	};

	document.addEventListener('click', () => closeMenu());

	const langSection = document.createElement("div");
	langSection.className = "p-3 rounded-xl flex items-center justify-center";
	langSection.style.maxWidth = "100%";
	langSection.style.boxSizing = "border-box";
	langSection.appendChild(langButton);
	langSection.appendChild(langMenu);

	return langSection;
}

export function SettingsPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "flex flex-col justify-center items-center bg-linear-to-br from-green-500 via-black to-green-800 pt-40 h-screen gap-4";

	const title = document.createElement("h2");
	title.textContent = translations[getCurrentLang()].settings;
	title.className = "fixed text-8xl top-0 p-6 z-1000";
	mainContainer.appendChild(title);

	const settingsContainer = document.createElement("div");
	settingsContainer.className = "rounded-xl flex justify-around items-center border-2 border-white w-9/10 h-9/10";

	const langSettingsSection = document.createElement("div");
	langSettingsSection.className = "w-1/2"

	const langSection = createLangSection();
	langSection.className += "p-20 items-center justify-center";
	langSettingsSection.appendChild(langSection);

	const line = document.createElement('div');
	line.className = "w-[0.2rem] self-stretch bg-white/70 mx-6";

	const changeInfoSection = document.createElement("div");
	changeInfoSection.className = "rounded-xl flex flex-col items-center justify-between w-full gap-6";

	const changeMailSection = document.createElement("div");
	changeMailSection.className = "rounded-xl flex flex-col items-center justify-between w-full";
	changeMailSection.textContent = "mail";
	changeInfoSection.appendChild(changeMailSection);

	const changePasswordSection = document.createElement("div");
	changePasswordSection.className = "rounded-xl flex flex-col items-center justify-between w-full";
	changePasswordSection.textContent = "mail";
	changeInfoSection.appendChild(changePasswordSection);



	settingsContainer.appendChild(langSettingsSection);
	settingsContainer.appendChild(line);
	settingsContainer.appendChild(changeInfoSection);
	mainContainer.appendChild(settingsContainer);

	return mainContainer;
}
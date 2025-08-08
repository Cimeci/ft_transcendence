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
	langButton.className = 'p-10 bg-transparent border-none cursor-pointer flex items-center justify-center';

	const imgBtn = document.createElement("img");
	imgBtn.src = "/translate.png";
	imgBtn.alt = "Lang";
	imgBtn.className = "size-40";

	langButton.appendChild(imgBtn);

	const langMenu = document.createElement('ul');
	langMenu.className = 'size-40 m-2 flex-1 bg-[#242424] rounded shadow-lg z-50 text-white border border-green-700';
	langMenu.style.display = 'none';
	langMenu.style.minWidth = '120px';
	langMenu.style.listStyle = 'none';
	langMenu.style.padding = '0';

	const languages = [
		{ code: 'fr', label: 'Français' },
		{ code: 'en', label: 'English' },
		{ code: 'es', label: 'Español' }
	];

	languages.forEach(lang => {
		const li = document.createElement('li');
		li.className = 'px-4 py-2 hover:bg-green-700 cursor-pointer h-1/3 flex items-center';
		li.textContent = lang.label;
		li.onclick = () => {
			setLanguage(lang.code);
			langMenu.style.display = 'none';
		};
		langMenu.appendChild(li);
	});

	langButton.onclick = (e) => {
		e.stopPropagation();
		langMenu.style.display = langMenu.style.display === 'none' ? 'block' : 'none';
	};
	document.addEventListener('click', () => {
		langMenu.style.display = 'none';
	});

	const langSection = document.createElement("div");
	langSection.className = "border-2 rounded-xl flex items-center justify-center";
	langSection.style.width = "350px";
	langSection.style.height = "15rem";
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
    settingsContainer.className = "flex justify-center items-center border-2 w-9/10 h-9/10";

    const langSection = createLangSection();
    langSection.className += " max-w-xs w-full";

    settingsContainer.appendChild(langSection);
    mainContainer.appendChild(settingsContainer);

    return mainContainer;
}
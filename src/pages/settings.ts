import { translations } from '../i18n';

export function getCurrentLang(): 'fr' | 'en' | 'es' {
	return (localStorage.getItem('lang') as 'fr' | 'en' | 'es') || 'en';
}

function setLanguage(lang: string) {
	localStorage.setItem('lang', lang);
	if (typeof window.renderPage === 'function') window.renderPage();
}

const langDropdownContainer = document.createElement('div');
langDropdownContainer.style.position = 'relative';
langDropdownContainer.style.marginRight = '0.5rem';

const langButton = document.createElement('button');
langButton.type = 'button';
langButton.className = 'ml-2 p-1 bg-transparent border-none cursor-pointer flex items-center';
langButton.innerHTML = `<img src="/langue.png" alt="Lang" class="translate-icon" />`;

const langMenu = document.createElement('ul');
langMenu.className = 'mt-2 bg-[#242424] rounded shadow-lg z-50 text-white border border-cyan-700';
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
	li.className = 'px-4 py-2 hover:bg-cyan-700 cursor-pointer';
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


export function SettingsPage(): HTMLElement {
    const mainContainer = document.createElement("div");
    mainContainer.className = "bg-green-300 flex flex-col items-center pt-40 h-screen gap-4";
    
    const title = document.createElement("h2");
    title.textContent = translations[getCurrentLang()].settings;
    title.className = "fixed top-0 p-6 z-1000";

    const langSection = document.createElement("div");
    langSection.className = "flex items-center gap-2";
    langSection.appendChild(langButton);
    langSection.appendChild(langMenu);

    mainContainer.appendChild(title);
    mainContainer.appendChild(langSection);

    return mainContainer;
}
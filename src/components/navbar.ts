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
langButton.innerHTML = `<img src="/translate.png" alt="Lang" class="translate-icon" />`;

const langMenu = document.createElement('ul');
langMenu.className = 'absolute right-0 mt-2 bg-[#242424] rounded shadow-lg z-50 text-white border border-cyan-700';
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

langDropdownContainer.appendChild(langButton);
langDropdownContainer.appendChild(langMenu);

export function createNavbar(routes: { [key: string]: string }): HTMLElement {
	const nav = document.createElement('nav');
	nav.className = 'navbar-burger p-4 text-white flex items-center justify-between fixed top-0 left-0 right-0 w-full z-50 bg-[#242424]/75 backdrop-blur-sm';

	// Logo à gauche
	const logo = document.createElement('a');
	logo.href = '/';
	logo.setAttribute('data-link', '');
	logo.textContent = 'ft_transcendence';
	logo.className = 'font-bold text-lg md:text-xl lg:text-2xl px-2';
	nav.appendChild(logo);

	// Container à droite (langue + burger)
	const rightContainer = document.createElement('div');
	rightContainer.className = 'flex items-center gap-2';

	// Bouton burger à droite
	const hamburgerBtn = document.createElement('button');
	hamburgerBtn.className = 'hamburger-btn-burger';
	hamburgerBtn.innerHTML = '☰';
	rightContainer.appendChild(hamburgerBtn);

	// Langue à droite
	rightContainer.appendChild(langDropdownContainer);
	nav.appendChild(rightContainer);

	// Menu burger (slide-in depuis la droite)
	const navLinks = document.createElement('div');
	navLinks.className = 'navbar-links-burger';
	for (const path in routes) {
		const link = document.createElement('a');
		link.href = path;
		link.textContent = routes[path];
		link.setAttribute('data-link', '');
		link.className = 'px-2 py-1 lg:text-lg transition-all duration-300 hover:text-[#C3BABA] hover:font-bold hover:scale-110';
		navLinks.appendChild(link);
	}
	nav.appendChild(navLinks);

	hamburgerBtn.addEventListener('click', () => {
		navLinks.classList.toggle('open');
	});

	return nav;
}
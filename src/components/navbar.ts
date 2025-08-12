import { translations } from '../i18n';
import { getCurrentLang } from '../pages/settings';
import { navigateTo } from '../routes';

export function createNavbar(routes: { [key: string]: string }): HTMLElement {
	const nav = document.createElement('nav');
	nav.className = 'navbar-burger';

	const homeLogo = document.createElement('img');
	homeLogo.setAttribute('data-link', '');
	homeLogo.src =  "/house.svg";
	homeLogo.className = 'ml-3 right-10 size-10 cursor-pointer hover:scale-110 duration-300 transition-all';
	homeLogo.addEventListener('click', () => {
		navigateTo("/home");
	})
	nav.appendChild(homeLogo);

	const hamburgerBtn = document.createElement('button');
	hamburgerBtn.className = 'hamburger-btn-burger';
	hamburgerBtn.innerHTML = '☰';
	nav.appendChild(hamburgerBtn);

	const navLinks = document.createElement('div');
	navLinks.className = 'navbar-links-burger';

	const routeKeys = Object.keys(routes);
	for (let i = 0; i < routeKeys.length; i++) {
		const path = routeKeys[i];
		const key = routes[path];
		const link = document.createElement('a');
		link.href = path;
		link.setAttribute('data-link', '');
		link.dataset.i18n = key;
		link.textContent = routes[path];
		// @ts-ignore
		link.textContent = translations[getCurrentLang()][key] ?? key;
		if (i === routeKeys.length - 1)
			link.className = 'text-2xl transition-all duration-300 text-red-600 hover:font-bold hover:scale-110 hover:text-red-800';
		else
			link.className = 'text-2xl transition-all duration-300 hover:text-[#C3BABA] hover:font-bold hover:scale-110';
		navLinks.appendChild(link);
	}

	const creditsLogo = document.createElement('a');
	creditsLogo.href = '/credits';
	creditsLogo.setAttribute('data-link', '');
	creditsLogo.textContent = '©';
	creditsLogo.className = 'absolute bottom-4 right-4 text-3xl text-white-400 hover:font-bold hover:scale-110 hover:text-green-600';
	navLinks.appendChild(creditsLogo);

	nav.appendChild(navLinks);

	hamburgerBtn.addEventListener('click', () => {
		navLinks.classList.toggle('open');
	});

	window.addEventListener('langchange', () => {
        navLinks.querySelectorAll('a[data-i18n]').forEach(link => {
            const key = link.getAttribute('data-i18n')!;
			// @ts-ignore
            link.textContent = translations[getCurrentLang()][key] ?? key;
        });
    });

	return nav;
}
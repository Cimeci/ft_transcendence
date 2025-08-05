
export function createNavbar(routes: { [key: string]: string }): HTMLElement {
	const nav = document.createElement('nav');
	nav.className = 'navbar-burger';

	// Logo à gauche
	const logo = document.createElement('a');
	logo.href = '/';
	logo.setAttribute('data-link', '');
	logo.textContent = '🏠';
	logo.className = 'important-text pl-4';
	nav.appendChild(logo);

	// Bouton burger à droite
	const hamburgerBtn = document.createElement('button');
	hamburgerBtn.className = 'hamburger-btn-burger';
	hamburgerBtn.innerHTML = '☰';
	nav.appendChild(hamburgerBtn);

	// Langue à droite

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
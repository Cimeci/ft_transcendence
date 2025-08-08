export function createNavbar(routes: { [key: string]: string }): HTMLElement {
	const nav = document.createElement('nav');
	nav.className = 'navbar-burger';

	const logo = document.createElement('a');
	logo.href = '/home';
	logo.setAttribute('data-link', '');
	logo.textContent = '🏠';
	logo.className = 'important-text pl-4';
	nav.appendChild(logo);

	const hamburgerBtn = document.createElement('button');
	hamburgerBtn.className = 'hamburger-btn-burger';
	hamburgerBtn.innerHTML = '☰';
	nav.appendChild(hamburgerBtn);

	const navLinks = document.createElement('div');
	navLinks.className = 'navbar-links-burger';
	const routeKeys = Object.keys(routes);
	for (let i = 0; i < routeKeys.length; i++) {
		const path = routeKeys[i];
		const link = document.createElement('a');
		link.href = path;
		link.textContent = routes[path];
		link.setAttribute('data-link', '');
		link.className = 'text-2xl transition-all duration-300 hover:text-[#C3BABA] hover:font-bold hover:scale-110 hover:text-green-800';
		if (i === routeKeys.length - 1) {
			link.className += ' text-red-500';
		}
		navLinks.appendChild(link);
	}
	nav.appendChild(navLinks);

	hamburgerBtn.addEventListener('click', () => {
		navLinks.classList.toggle('open');
	});

	return nav;
}
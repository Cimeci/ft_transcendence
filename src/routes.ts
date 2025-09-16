import './style.css';
import { createNavbar} from './components/navbar';
import { HomePage } from './pages/home';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { ShopPage } from './pages/shop';
import { InventoryPage } from './pages/inventory';
import { SettingsPage, getCurrentLang } from './pages/settings';
import { translations } from './i18n';
import { PongMenuPage, PongGamePage, PongOverlayPage } from './pages/pong';
import { PongTournamentMenuPage, PongTournamentPageJoin, PongTournamentPageHost } from './pages/tournament';
import { LandingPage } from './pages/landing';
import { CreditsPage } from './pages/credits';
import { FriendsPage } from './pages/friends';
import { UserPage } from './pages/user';

const routes: { [key: string]: () => HTMLElement } = {
	'/': LandingPage,
	'/home': HomePage,
	'/login': LoginPage,
	'/register': RegisterPage,
	'/shop': ShopPage,
	'/friends': FriendsPage,
	'/inventory': InventoryPage,
	'/pong': PongMenuPage,
	'/pong/game': PongGamePage,
	'/pong/game/overlay': PongOverlayPage,
	'/tournament/menu': PongTournamentMenuPage,
	'/tournament/host': PongTournamentPageHost,
	'/tournament/join': PongTournamentPageJoin,
	'/settings': SettingsPage,
	'/credits': CreditsPage,
	'/user': UserPage,
};

export const navigateTo = (url: string) => {
	history.pushState(null, '', url);
	renderPage();
};

const renderPage = () => {
	const path = window.location.pathname;
	const pageRenderer = routes[path];
	let contentToRender: HTMLElement;
	if (typeof pageRenderer === 'function') {
		contentToRender = pageRenderer();
	} else {
		const notFound = document.createElement('div');
        notFound.innerHTML = '<h1 class="text-6xl font-bold mb-4">404</h1><p class="text-2xl">Page not found.</p>';
        notFound.className = "bg-gradient-to-r from-black via-green-900 to-black text-white flex items-center justify-center flex-1 bg-black bg-opacity-90 p-0 z-2002";
        contentToRender = notFound;
	}
 
	const appElement = document.getElementById('app');
	if (appElement) {
		appElement.innerHTML = '';
		appElement.appendChild(contentToRender);
	}

	// Navbar links update
	const oldNavbar = document.querySelector('nav.navbar-burger');
    if (oldNavbar) oldNavbar.remove();
    const navbar = createNavbar(navRoutesForNavbar);
    document.body.prepend(navbar);

	const navbarLinks = document.querySelectorAll('nav .navbar-links a[data-link]');
	navbarLinks.forEach(link => {
		const href = link.getAttribute('href');
		if (href === path) {
			link.classList.add('active');
		} else {
			link.classList.remove('active');
		}
	});
};

document.addEventListener('click', event => {
	const target = event.target as HTMLElement;
	const linkElement = target.closest('[data-link]') as HTMLAnchorElement | null;
	if (linkElement) {
		event.preventDefault();
		navigateTo(linkElement.getAttribute('href')!);
		//* close navbar *//
		const navLinks = document.querySelector('.navbar-links-burger');
		if (navLinks && navLinks.classList.contains('open')) {
			navLinks.classList.remove('open');
		}
	}
});

window.addEventListener('popstate', renderPage);

const navRoutesForNavbar: { [key: string]: string } = {
    // '/home': 'home',
	'/friends': 'friends',
    '/inventory': 'inventory',
    '/shop': 'shop',
    '/settings': 'settings',
    // '/': 'logout',
};
const navbar = createNavbar(navRoutesForNavbar);
document.body.prepend(navbar);

window.renderPage = renderPage;
renderPage();
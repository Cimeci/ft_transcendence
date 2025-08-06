import './style.css';
import { createNavbar} from './components/navbar';
import { HomePage } from './pages/home';
import { LoginPage } from './pages/login';
import { ShopPage } from './pages/shop';
import { InventoryPage } from './pages/inventory';
import { SettingsPage, getCurrentLang } from './pages/settings';
import { translations } from './i18n';

const routes: { [key: string]: () => HTMLElement } = {
	'/': HomePage,
	'/login': LoginPage,
	'/shop': ShopPage,
	'/inventory': InventoryPage,
	'/settings': SettingsPage,
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
        notFound.className = "text-green-600 flex items-center justify-center flex-1 bg-black bg-opacity-90 p-0 z-2002";
        contentToRender = notFound;
	}
 
	const appElement = document.getElementById('app');
	if (appElement) {
		appElement.innerHTML = '';
		appElement.appendChild(contentToRender);
	}

	// Navbar links update
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
	}
});

window.addEventListener('popstate', renderPage);

const navRoutesForNavbar: { [key: string]: string } = {
	'/': translations[getCurrentLang()].home,
	'/login': translations[getCurrentLang()].login,
	'/shop': translations[getCurrentLang()].shop,
	'/inventory': translations[getCurrentLang()].inventory,
	'/settings': translations[getCurrentLang()].settings,
};
const navbar = createNavbar(navRoutesForNavbar);
document.body.prepend(navbar);

window.renderPage = renderPage;
renderPage();
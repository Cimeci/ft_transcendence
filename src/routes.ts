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
import { PongTournamentMenuPage, PongTournamentPageJoin, PongTournamentPageHost, PongTournamentPageCurrentGame } from './pages/tournament';
import { LandingPage } from './pages/landing';
import { CreditsPage } from './pages/credits';
import { FriendsPage, type InvitePayload } from './pages/friends';
import { UserPage } from './pages/user';
import { addNotification, removeNotification } from './components/notifications_overlay'

document.getElementById("jschef")?.remove();

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
	'/tournament/game': PongTournamentPageCurrentGame,
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
		notFound.innerHTML = '<h1 class="md:text-6xl sm:text-4xl text-2xl font-bold mb-4">404</h1><p class="text-2xl">Page not found.</p>';
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
	'/friends': 'friends',
	'/inventory': 'inventory',
	'/shop': 'shop',
	'/settings': 'settings',
};
const navbar = createNavbar(navRoutesForNavbar);
document.body.prepend(navbar);
positionToastRoot();

//! GLOBAL POPUP Invitation
declare global {
  	interface Window {
		renderPage?: () => void;
		showInvite: (payload: InvitePayload) => void;
  	}
}

function ensureTopRightToastRoot(): HTMLDivElement {
  	let root = document.getElementById('toast-right-root') as HTMLDivElement | null;
  	if (!root) {
		root = document.createElement('div');
		root.id = 'toast-right-root';
		root.className = 'fixed right-3 z-[4000] pointer-events-none flex flex-col items-end gap-2';
		document.body.appendChild(root);
  	}
  	const nav = document.querySelector('nav') as HTMLElement | null;
  	const top = (nav?.offsetHeight || 56) + 8; // hauteur navbar + 8px
  	root.style.top = `${top}px`;
  	return root;
}

function positionToastRoot() {
  	const root = document.getElementById('toast-right-root') as HTMLDivElement | null;
  	if (root) {
		const nav = document.querySelector('nav') as HTMLElement | null;
		const top = (nav?.offsetHeight || 56) + 8;
		root.style.top = `${top}px`;
  	}
}

function makeInviteToast(p: InvitePayload): HTMLDivElement {
  	const toast = document.createElement('div');
  	toast.className = 'pointer-events-auto glass-blur text-white rounded-xl border border-white/20 shadow px-3 py-2 w-[min(92vw,380px)] flex items-center gap-3 toast-right-enter';

  	// Avatar rond noir
  	const avatarWrap = document.createElement('div');
  	avatarWrap.className = 'w-10 h-10 rounded-full bg-black flex items-center justify-center flex-none';
  	const avatar = document.createElement('img');
  	avatar.src = p.avatar || '/avatar/default_avatar.png';
  	avatar.alt = '';
  	avatar.className = 'w-full h-full object-contain rounded-full';
  	avatarWrap.appendChild(avatar);
  	toast.appendChild(avatarWrap);

  	// Texte (nom + activité/message)
  	const textWrap = document.createElement('div');
  	textWrap.className = 'min-w-0 flex-1';
  	const title = document.createElement('p');
  	title.className = 'font-semibold truncate';
  	title.textContent = p.username;
  	const sub = document.createElement('p');
  	sub.className = 'text-sm text-white/80 truncate';
  	sub.textContent = p.message ?? 'invites you to play';
  	textWrap.appendChild(title); textWrap.appendChild(sub);
  	toast.appendChild(textWrap);

  	// Actions
  	const actions = document.createElement('div');
  	actions.className = 'flex items-center gap-2';
  	const accept = document.createElement('button');
  	accept.className = 'px-2 py-1 rounded-md bg-green-600 hover:bg-green-700 text-sm';
  	accept.textContent = 'Accept';
  	accept.onclick = () => { p.onAccept?.(); close(); };
  	const refuse = document.createElement('button');
  	refuse.className = 'px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-sm';
  	refuse.textContent = 'Refuse';
  	refuse.onclick = () => { p.onRefuse?.(); close(); };
  	actions.appendChild(accept); actions.appendChild(refuse);
  	toast.appendChild(actions);

  	// Lifecycle 5s (pause au survol)
  	let timer: number | undefined;
  	const start = () => { timer = window.setTimeout(close, 5000); };
  	const stop = () => { if (timer) { clearTimeout(timer); timer = undefined; } };
  	const close = () => {
		stop();
		toast.classList.remove('toast-right-enter');
		toast.classList.add('toast-right-leave');
		toast.addEventListener('animationend', () => toast.remove(), { once: true });
  	};
  	toast.addEventListener('mouseenter', stop);
  	toast.addEventListener('mouseleave', start);
  	start();
  	return toast;
}

window.addEventListener('invite:show', (e: Event) => {
  	const detail = (e as CustomEvent<InvitePayload>).detail;
  	ensureTopRightToastRoot().appendChild(makeInviteToast(detail));
});

// Helper pour déclencher depuis n’importe où
window.showInvite = (payload: InvitePayload) => {
	const n = addNotification(payload);
   	window.dispatchEvent(new CustomEvent<InvitePayload>('invite:show', { detail: payload }));
 };

window.addEventListener('resize', positionToastRoot);

window.renderPage = renderPage;
renderPage();
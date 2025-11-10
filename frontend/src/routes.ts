import './style.css';
import { t } from './pages/settings'
import { createNavbar} from './components/navbar';
import { HomePage } from './pages/home';
import { LoginPage, OAuthCallbackPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { ShopPage } from './pages/shop';
import { InventoryPage } from './pages/inventory';
import { SettingsPage } from './pages/settings';
import { PongMenuPage } from './pages/pong';
import { PongLocalMenuPage, PongLocalGamePage, PongLocalOverlayPage } from './pages/pongLocal';
import { PongOnlineMenuPage, PongOnlineGamePage, PongOnlineOverlayPage } from './pages/pongOnline';
import { PongTournamentMenuPage, PongTournamentPageJoin, PongTournamentPageHost, PongTournamentPageCurrentGame } from './pages/tournament';
import { LandingPage } from './pages/landing';
import { CreditsPage } from './pages/credits';
import { FriendsPage } from './pages/friends';
import { UserPage } from './pages/user';
import { addNotification, loadAndDisplayNotifications, type InvitePayload } from './components/notifications_overlay'
import { ensureUser, onUserChange} from './linkUser';

const publicRoot = ['/', '/login', '/register', '/oauth/callback'];
const privateRoot = ['/home', '/shop', '/friends', '/inventory', '/pong/menu', '/pong/local/menu', '/pong/local/game', '/pong/local/game/overlay', '/pong/online/menu', '/pong/online/game', '/pong/online/game/overlay', '/Tournament/menu', '/Tournament/host', '/Tournament/join', '/Tournament/bracket', '/settings', '/credits', '/profile'];

document.getElementById("jschef")?.remove();

function render401(): HTMLElement {
  	const el = document.createElement('div');
  	el.className = 'bg-gradient-to-r from-black via-green-900 to-black text-white flex items-center justify-center flex-1 bg-opacity-90 p-0 z-2002';

	const main = document.createElement("div");
	main.className = "flex flex-col justify-center text-center p-8";
	el.appendChild(main);

	const div = document.createElement("div");{
	div.className = "flex flex-col justify-center text-center";
	main.appendChild(div);

	const h1 = document.createElement("h1");
	h1.className = "md:text-6xl sm:text-4xl text-3xl font-bold mb-4 duration-400 transition-all hover:scale-105";
	h1.textContent = "401";
	div.appendChild(h1);

	const p = document.createElement("p");
	p.className = "text-2xl duration-400 transition-all hover:scale-105";
	p.textContent = "Unauthorized";
	div.appendChild(p);
	}

	const a = document.createElement("a");
	a.className = "absolute bottom-1/4 text-green-400 text-2xl hover:text-green-500 duration-400 transition-all hover:scale-105";
	a.href = "/login";
	a.textContent = "Return to login page";
	el.appendChild(a);

  	return el;
}

function render404(): HTMLElement {
  	const el = document.createElement('div');
  	el.className = 'bg-gradient-to-r from-black via-green-900 to-black text-white flex items-center justify-center flex-1 bg-opacity-90 p-0 z-2002';

	const main = document.createElement("div");
	main.className = "flex flex-col justify-center text-center p-8";
	el.appendChild(main);

	const div = document.createElement("div");{
	div.className = "flex flex-col justify-center text-center";
	main.appendChild(div);

	const h1 = document.createElement("h1");
	h1.className = "md:text-6xl sm:text-4xl text-3xl font-bold mb-4 duration-400 transition-all hover:scale-105";
	h1.textContent = "404";
	div.appendChild(h1);

	const p = document.createElement("p");
	p.className = "text-2xl duration-400 transition-all hover:scale-105";
	p.textContent = "Not Found";
	div.appendChild(p);
	}

	const a = document.createElement("a");
	a.className = "absolute bottom-1/4 text-green-400 text-2xl hover:text-green-500 duration-400 transition-all hover:scale-105";
	a.href = "/login";
	a.textContent = "Return to login page";
	el.appendChild(a);

  	return el;
}

const routes: { [key: string]: () => HTMLElement } = {
	'/': LandingPage,
	'/login': LoginPage,
	'/register': RegisterPage,
	'/home': HomePage,
	'/shop': ShopPage,
	'/friends': FriendsPage,
	'/inventory': InventoryPage,
	'/pong/menu': PongMenuPage,
	'/pong/local/menu': PongLocalMenuPage,
	'/pong/local/game': PongLocalGamePage,
	'/pong/local/game/overlay': PongLocalOverlayPage,
	'/pong/online/menu': PongOnlineMenuPage,
	'/pong/online/game': PongOnlineGamePage,
	'/pong/online/game/overlay': PongOnlineOverlayPage,
	'/Tournament/menu': PongTournamentMenuPage,
	'/Tournament/host': PongTournamentPageHost,
	'/Tournament/join': PongTournamentPageJoin,
	'/Tournament/bracket': PongTournamentPageCurrentGame,
	'/settings': SettingsPage,
	'/credits': CreditsPage,
	'/profile': UserPage,
	'/oauth/callback': OAuthCallbackPage
};

export const navigateTo = async (url: string) => {
	history.pushState(null, '', url);
	if (url.search('profile') != -1)
		document.location.reload();
	await renderPage();
};

async function isJwtValid(): Promise<boolean> {
    const jwt = localStorage.getItem("jwt");
    console.log("CHECK JWT", jwt);
    if (!jwt) return false;
    
    try {
        const resp = await fetch(`/user/jwt-test`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${jwt}`,
            }
        });
        
        console.log("RESP JWT Status:", resp.status, "OK:", resp.ok);
        
        if (!resp.ok) {
            try {
                const errorData = await resp.json();
                console.error("JWT ERROR Details:", errorData);
            } catch (e) {
                console.error("JWT ERROR Status:", resp.status, "No details available");
            }
            return false;
        }
        
        // Vérifier que la réponse est valide
        const data = await resp.json();
        console.log("JWT SUCCESS:", data);
        return true;
        
    } catch (e) {
        console.error("POST JWT Network Error: ", e);
        return false;
    }
}

const renderPage = async () => {
    const path = window.location.pathname;
    const isPublic = publicRoot.includes(path);
	const isPrivate = privateRoot.includes(path);

    console.log("Rendering page:", path, "isPublic:", isPublic);
    
    if (isPublic) {
        console.log("Public route, rendering directly");
        renderContent(path);
        return;
    }
    
    const jwtValid = await isJwtValid();
    console.log("Private route - JWT valid:", jwtValid);
    
    if (!jwtValid && isPrivate) {
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = '';
            appContainer.appendChild(render401());
        }
        return;
    }
    renderContent(path);
};

function renderContent(path: string) {
    const pageRenderer = routes[path];
    let contentToRender: HTMLElement;

    if (typeof pageRenderer === 'function') {
        contentToRender = pageRenderer();
    } else {
        contentToRender = render404();
    }

    const appElement = document.getElementById('app');
    if (appElement) {
        appElement.innerHTML = '';
        appElement.appendChild(contentToRender);
    }

    const oldNavbar = document.querySelector('nav.navbar-burger');
    if (oldNavbar)
        oldNavbar.remove();

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
}

document.addEventListener('click', event => {
	const target = event.target as HTMLElement;
	const linkElement = target.closest('[data-link]') as HTMLAnchorElement | null;
	if (linkElement) {
		event.preventDefault();
		navigateTo(linkElement.getAttribute('href')!);

		const navLinks = document.querySelector('.navbar-links-burger');
		if (navLinks && navLinks.classList.contains('open')) {
			navLinks.classList.remove('open');
		}
	}
});

window.addEventListener('popstate', () => renderPage());

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

  	const avatarWrap = document.createElement('div');
  	avatarWrap.className = 'w-10 h-10 rounded-full bg-black flex items-center justify-center flex-none';

  	const avatar = document.createElement('img');
  	avatar.src = p.avatar || '/avatar/default_avatar.png';
  	avatar.alt = '';
  	avatar.className = 'w-full h-full object-contain rounded-full';
  	avatarWrap.appendChild(avatar);
  	toast.appendChild(avatarWrap);

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
  	accept.textContent = t.accept;
  	accept.onclick = () => { p.onAccept?.(); close(); };

  	const refuse = document.createElement('button');
  	refuse.className = 'px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-sm';
  	refuse.textContent = t.refuse;
  	refuse.onclick = () => { p.onRefuse?.(); close(); };
  	actions.appendChild(accept); actions.appendChild(refuse);
  	toast.appendChild(actions);

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

window.showInvite = (payload: InvitePayload) => {
	addNotification(payload);
   	window.dispatchEvent(new CustomEvent<InvitePayload>('invite:show', { detail: payload }));
};

window.addEventListener('resize', positionToastRoot);


async function bootstrap() {
  	await ensureUser();
  	window.renderPage = renderPage;
  	renderPage();

  	loadAndDisplayNotifications();
}

onUserChange(() => {
  	const oldNavbar = document.querySelector('nav.navbar-burger');
  	if (oldNavbar) oldNavbar.remove();
  	const navbar = createNavbar(navRoutesForNavbar);
  	document.body.prepend(navbar);
});

bootstrap();
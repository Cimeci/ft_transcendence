import { translations } from '../i18n';
import { getCurrentLang, t } from '../pages/settings';
import { navigateTo } from '../routes';
import { getUser, onUserChange } from '../linkUser';
import { notifications, removeNotification } from './notifications_overlay';



export type Notification = {
	key: string;
	username: string;
	id: string;
	avatar: string;
	message?: string;
	onAccept?: () => void;
	onRefuse?: () => void;
	createdAt: number;
};

type CosmeticType = 'avatar' | 'background' | 'paddle' | 'ball';

interface CosmeticItem {
    src?: string;
    id: string;
    name: string;
    type?: string;
    price: number;
    usable?: boolean;
};

interface InventoryResponse {
	ball: CosmeticItem[];
	background: CosmeticItem[];
	 paddle: CosmeticItem[];
	avatar: CosmeticItem[];
	ball_use: { id: string; name: string }[];
	background_use: { id: string; name: string }[];
	paddle_use: { id: string; name: string }[];
	avatar_use: { id: string; name: string }[];
}

const setUserOnline = async (uuid: string, online: string) => {
	console.log("USER ONLINE", uuid, online);
	const res = await fetch('/user/env', { method: 'GET' });
  	const response = await fetch('/user/online', {
    	method: 'PATCH',
    	headers: {
      		'Content-Type': 'application/json',
			'x-internal-key': (await res.json()).JWT_SECRET || ""
    	},
    	body: JSON.stringify({ uuid, online })
  	});

  	if (!response.ok) {
    	console.error('Erreur:', await response.json());
  	} else {
    	console.log('Mise à jour réussie !');
  	}
};

export function createNavbar(routes: { [key: string]: string }): HTMLElement {
	const nav = document.createElement('nav');
	nav.className = 'navbar-burger flex items-center';

	const homeLogo = document.createElement('img');
	homeLogo.setAttribute('data-link', '');
	homeLogo.src =  "/icons/house.svg";
	homeLogo.className = 'ml-3 right-10 size-10 cursor-pointer active:scale-105 hover:scale-110 duration-300 transition-all';
	homeLogo.addEventListener('click', () => {
		setTimeout(() => {navigateTo("/home")}, 100);
	})
	nav.appendChild(homeLogo);
 
	const rightBox = document.createElement('div');
	rightBox.className = 'z-[2000] ml-auto flex items-center gap-3 mr-3';

	const hamburgerBtn = document.createElement('button');{
	hamburgerBtn.className = 'w-8 h-8 hover:scale-105 duration-300 transition-all justify-center items-center';
	}

	const hamburgerIcon = document.createElement('img');{
	hamburgerIcon.src = "/icons/list.svg";
	hamburgerIcon.className = "w-full h-full";
	hamburgerBtn.appendChild(hamburgerIcon);
	}

	const notifBtn = document.createElement("button");{
	notifBtn.className = "z-[2000] flex justify-center items-center w-6 h-6 object-cover hover:scale-105 duration-300 transition-all";
	}

	const notifIcon = document.createElement("img");{
	notifIcon.src = "/icons/bell.svg";
	notifIcon.className = "w-full h-full";
	notifBtn.appendChild(notifIcon);
	}

	const overlayNotif = document.createElement("div");{
	overlayNotif.id = "notif-panel";
	overlayNotif.className = "fixed top-16 right-3 w-[min(92vw,380px)] max-h-[60vh] min-h-[5vh] overflow-y-auto glass-blur text-white rounded-xl border border-white/20 shadow p-2 hidden z-[3500] pointer-events-auto";
	document.body.appendChild(overlayNotif);
	}

	const listNotif = document.createElement("ul");{   
		listNotif.className = "flex flex-col gap-2";
		overlayNotif.appendChild(listNotif);
	}

	function renderNotifs() {
	  listNotif.innerHTML = "";
	  notifications.forEach(n => {
		const li = document.createElement("li");
		li.className = "w-full flex items-center gap-3 p-2 rounded-lg bg-white/5";

		const avatarWrap = document.createElement('div');
		avatarWrap.className = 'w-10 h-10 rounded-full bg-black flex items-center justify-center flex-none';
		
		const avatar = document.createElement('img');
		avatar.src = n.avatar || '/avatar/default_avatar.png';
		avatar.alt = '';
		avatar.className = 'w-full h-full object-contain rounded-full';
		avatarWrap.appendChild(avatar);
		li.appendChild(avatarWrap);

		const textWrap = document.createElement('div');
		textWrap.className = 'min-w-0 flex-1';

		const title = document.createElement('p');
		title.className = 'font-semibold truncate';
		title.textContent = n.username;

		const sub = document.createElement('p');
		sub.className = 'text-sm text-white/80 truncate';
		sub.textContent = n.message ?? 'invites you to play';
	
		textWrap.appendChild(title); textWrap.appendChild(sub);
		li.appendChild(textWrap);

		const actions = document.createElement('div');
		actions.className = 'flex items-center gap-2';

		const accept = document.createElement('button');
		accept.className = 'px-2 py-1 rounded-md bg-green-600 hover:bg-green-700 text-sm';
		accept.textContent = 'Accept';
		accept.onclick = () => { n.onAccept?.(); removeNotification(n.key); };

		const refuse = document.createElement('button');
		refuse.className = 'px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-sm';
		refuse.textContent = 'Refuse';
		refuse.onclick = () => { n.onRefuse?.(); removeNotification(n.key); };

		actions.appendChild(accept); actions.appendChild(refuse);
		li.appendChild(actions);

		listNotif.appendChild(li);
	  });
	}

	notifBtn.addEventListener('click', (e) => {
	  	e.stopPropagation();
	  	overlayNotif.classList.toggle('hidden');
		navLinks.classList.add('hidden');
	  	renderNotifs();
	});

	// document.addEventListener('click', (e) => {
	//   const t = e.target as Node;
	//   if (!overlayNotif.contains(t) && !notifBtn.contains(t)) overlayNotif.classList.add('hidden');
	// });

	window.addEventListener('notif:changed', renderNotifs);

	const profileBox = document.createElement('div');
	profileBox.className = 'z-[3500] flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 cursor-default transition-opacity duration-200 md:opacity-100';

	const avatarImg = document.createElement('img');
	// avatarImg.src = getUser()?.avatar || '/avatar/default_avatar.png';
	avatarImg.alt = 'avatar';
	avatarImg.className = 'z-[3500] w-8 h-8 rounded-full object-cover border border-white/20';

	async function setAvatar()
	{
    	const token = localStorage.getItem("jwt") || "";
    	if (!token) return null;

    	try {
    		const res = await fetch("/user/inventory", { headers: { Authorization: `Bearer ${token}` } });
    		if (!res.ok) throw new Error(`HTTP ${res.status}`);
    		const data = await res.json();
    		// avatar_use est un tableau: [{ id, name }]
    		const avatarUseArr = data?.filteredInventory?.avatar_use;
    		const id = avatarUseArr?.[0]?.id || getUser()?.avatar || 'avatar/default_avatar.png';
    		avatarImg.src = '/' + id.replace(/^\/+/, '');
			console.log("IMG ID:", id);
    	} catch (e) {
    		console.warn('Avatar fetch failed', e);
    	}
	}

	setAvatar();

	const nameSpan = document.createElement('span');
	nameSpan.textContent = getUser()?.username || "default";
	nameSpan.className = 'z-[3500] text-sm font-medium truncate max-w-[20ch] hidden sm:block';

	// loadUser().catch(() => {});

	profileBox.appendChild(avatarImg);
	profileBox.appendChild(nameSpan);

	rightBox.appendChild(profileBox);
	rightBox.appendChild(notifBtn);
	rightBox.appendChild(hamburgerBtn);

	profileBox.addEventListener("click", () => {
		const root =
			(document.getElementById('app') as HTMLElement) ||
			(document.body as HTMLElement) ||
			(document.documentElement as HTMLElement);
		if (root) {
			root.addEventListener('animationend', () => navigateTo("/profile"), { once: true });
			navigateTo(`/profile?id=${encodeURIComponent(getUser()?.uuid || t.err_id)}`);
		}
	});

	nav.appendChild(rightBox);

	// — Notifications overlay ancré à la fenêtre —

	const navLinks = document.createElement('div');
	navLinks.className = "fixed right-0 top-20 bottom-0 z-[1000] p-2 w-[8rem] md:w-[12rem] lg:w-[14rem] glass-blur flex flex-col gap-3 justify-center items-center hidden";
	document.body.appendChild(navLinks);

	const ul = document.createElement("ul");
	ul.className = "w-9/10 h-1/3 mb-30 flex flex-col justify-center items-center"
	navLinks.appendChild(ul);

	const routeKeys = Object.keys(routes);
	for (let i = 0; i < routeKeys.length; i++) {
		const li = document.createElement('li');
		li.className = 'md:pl-3 pl-0 pr-3 py-3 w-full h-full ml-0 md:ml-5 transition-all duration-300 hover:scale-110 flex justify-center items-center text-left';
		
		const link = document.createElement("a");
		link.href = routeKeys[i];
		link.setAttribute('data-link', '');
		link.dataset.i18n = routes[routeKeys[i]];
		link.className = "text-2xl w-full"
	   	const t = translations[getCurrentLang()] as any;
	   	const key = routes[routeKeys[i]];
	   	link.textContent = t?.[key] ?? key;

		li.appendChild(link);
		ul.appendChild(li);
	}

	const creditsLogo = document.createElement('a');
	creditsLogo.href = '/credits';
	creditsLogo.setAttribute('data-link', '');
	creditsLogo.textContent = '©';
	creditsLogo.className = 'absolute bottom-4 right-4 text-3xl text-white-400 hover:font-bold hover:scale-110 hover:text-green-600';
	navLinks.appendChild(creditsLogo);

	const deconnection = document.createElement('a');
	deconnection.href = '/';
	deconnection.setAttribute('data-link', '');
	deconnection.textContent = translations[getCurrentLang()].logout;
	deconnection.className = 'absolute bottom-5 left-5 text-xl text-red-600 hover:font-bold hover:scale-102 hover:text-red-700';
	deconnection.addEventListener(("click"), async () => {
		const uuid = getUser()?.uuid || "";
		await setUserOnline(uuid || "", "0");
		localStorage.clear();
	})
	navLinks.appendChild(deconnection);

	hamburgerBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		overlayNotif.classList.add('hidden');
		navLinks.classList.toggle('hidden');
	});

	// Fermer au clic extérieur (par rapport à la fenêtre)
	document.addEventListener('click', (e) => {
		const target = e.target as Node;
		if (!nav.contains(target) && !navLinks.contains(target) && !overlayNotif.contains(target)) {
			navLinks.classList.add('hidden');
			overlayNotif.classList.add('hidden');
		}
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') { navLinks.classList.add('hidden'); overlayNotif.classList.add('hidden'); }
	});

	window.addEventListener('langchange', () => {
		navLinks.querySelectorAll('a[data-i18n]').forEach(link => {
			const key = link.getAttribute('data-i18n')!;
			const t = translations[getCurrentLang()] as any;
     		link.textContent = t?.[key] ?? key;
		});
	});

	onUserChange(u => {
		nameSpan.textContent = u?.username || "default";
		avatarImg.src = u?.avatar || '/avatar/default_avatar.png';
	});

	return nav;
}
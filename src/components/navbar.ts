import { translations } from '../i18n';
import { getCurrentLang } from '../pages/settings';
import { navigateTo } from '../routes';
import { inputRef } from '../pages/friends';
import { userInventory, userName } from '../pages/inventory';

export function createNavbar(routes: { [key: string]: string }): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'navbar-burger flex items-center';

    const homeLogo = document.createElement('img');
    homeLogo.setAttribute('data-link', '');
    homeLogo.src =  "/house.svg";
    homeLogo.className = 'ml-3 right-10 size-10 cursor-pointer active:scale-105 hover:scale-110 duration-300 transition-all';
    homeLogo.addEventListener('click', () => {
        setTimeout(() => {navigateTo("/home")}, 100);
    })
    nav.appendChild(homeLogo);

    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-btn-burger';
    hamburgerBtn.innerHTML = '☰';
    hamburgerBtn.setAttribute('aria-label', 'Menu');
    hamburgerBtn.setAttribute('aria-controls', 'nav-links');

    const navLinks = document.createElement('div');
    navLinks.className = 'navbar-links-burger';
    navLinks.id = 'nav-links';

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
        link.className = 'text-2xl transition-all duration-300 hover:text-[#C3BABA] hover:font-bold hover:scale-110';
        navLinks.appendChild(link);
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
    navLinks.appendChild(deconnection);

    nav.appendChild(navLinks);

    // Profile box (à gauche du burger)
    const rightBox = document.createElement('div');
    rightBox.className = 'ml-auto flex items-center gap-3 mr-14 md:mr-14';

    const profileBox = document.createElement('div');
    profileBox.className = 'flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-white/10 cursor-default transition-opacity duration-200 md:opacity-100';

    const avatarImg = document.createElement('img');
    avatarImg.src = userInventory.avatar[0]?.id || '/avatar/default_avatar.png';
    avatarImg.alt = 'avatar';
    avatarImg.className = 'w-8 h-8 rounded-full object-cover border border-white/20';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = userName;
    nameSpan.className = 'text-sm font-medium truncate max-w-[20ch] hidden sm:block';

    profileBox.appendChild(avatarImg);
    profileBox.appendChild(nameSpan);
    rightBox.appendChild(profileBox);
    rightBox.appendChild(hamburgerBtn);
    nav.appendChild(rightBox);

    // Accessibilité: empêcher le focus quand la navbar est fermée
    const setNavOpen = (open: boolean) => {
        navLinks.classList.toggle('open', open);
        hamburgerBtn.setAttribute('aria-expanded', String(open));
        navLinks.setAttribute('aria-hidden', String(!open));
        const focusables = navLinks.querySelectorAll<HTMLElement>('a, button');
        focusables.forEach(el => el.tabIndex = open ? 0 : -1);
        if (open) navLinks.removeAttribute('inert'); else navLinks.setAttribute('inert', '');
        if (open) focusables[0]?.focus();
        profileBox.classList.toggle('opacity-0', open);
        profileBox.classList.toggle('pointer-events-none', open);
    };

    setNavOpen(false);

    // Ouvrir/fermer via le burger
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.contains('open');
        setNavOpen(!isOpen);
    });
    // Fermer après un clic sur un lien du menu
    navLinks.addEventListener('click', (e) => {
        const t = e.target as HTMLElement;
        if (t.closest('a')) setNavOpen(false);
    });

    // Fermer la navbar en cliquant en dehors
    document.addEventListener('click', (e) => {
        const target = e.target as Node;
        if (!nav.contains(target)) {
            setNavOpen(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setNavOpen(false);
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
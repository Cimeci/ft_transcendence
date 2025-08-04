import './style.css';
import { createNavbar, getCurrentLang } from './components/navbar';
import { HomePage } from './pages/main';
import { PongMenuPage, PongGamePage } from './pages/pong';
// import { PongTournamentPage } from './pages/tournament';
// import { PongMultiplayerPage, PongMultiplayerGamePage } from './pages/pong_multiplayer';
import { LoginPage } from './pages/login';
import { ShopPage } from './pages/shop';
import { translations } from './i18n';
import { gameState } from './gameState';
const routes = {
    "/": HomePage,
    "/pong": PongMenuPage,
    "/pong/game": PongGamePage,
    "/shop": ShopPage,
    "/login": LoginPage,
};
export const navigateTo = (url) => {
    gameState.executeCleanup();
    const isTournamentMatch = localStorage.getItem('currentTournamentMatch') !== null;
    if (isTournamentMatch &&
        !url.startsWith('/pong') &&
        !url.startsWith('/pong/game') &&
        !url.startsWith('/pong/tournament')) {
        const matchAborted = { aborted: true };
        localStorage.setItem('matchAborted', JSON.stringify(matchAborted));
        setTimeout(() => {
            localStorage.removeItem('currentTournamentMatch');
            localStorage.removeItem('matchAborted');
        }, 100);
    }
    history.pushState(null, "", url);
    renderPage();
};
const protectedRoutes = ['/', '/shop', '/pong', '/pong/game', '/login'];
const renderPage = () => {
    let path = window.location.pathname;
    const token = localStorage.getItem('token');
    if (!token && protectedRoutes.includes(path)) {
        path = '/login';
        history.replaceState(null, '', path);
    }
    const pageRendererOrContent = routes[path];
    let contentToRender;
    if (typeof pageRendererOrContent === 'function') {
        contentToRender = pageRendererOrContent();
    }
    else if (typeof pageRendererOrContent === 'string') {
        contentToRender = pageRendererOrContent;
    }
    else {
        contentToRender = "<h1>404</h1><p>Page non trouvée.</p>";
    }
    const appElement = document.getElementById("app");
    if (typeof contentToRender === 'string') {
        appElement.innerHTML = contentToRender;
    }
    else {
        appElement.innerHTML = '';
        appElement.appendChild(contentToRender);
    }
    const navbarLinks = document.querySelectorAll('nav .navbar-links a[data-link]');
    navbarLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === "/") {
            link.textContent = translations[getCurrentLang()].home;
        }
        else if (href === "/pong") {
            link.textContent = "Pong";
        }
        else if (href === "/team") {
            link.textContent = translations[getCurrentLang()].team;
        }
        if (href === path) {
            link.classList.add("active");
        }
        else {
            link.classList.remove("active");
        }
        if (!token && protectedRoutes.includes(href)) {
            link.classList.add('pointer-events-none', 'opacity-50');
            link.setAttribute('aria-disabled', 'true');
            link.style.cursor = 'not-allowed';
        }
        else {
            link.classList.remove('pointer-events-none', 'opacity-50');
            link.removeAttribute('aria-disabled');
            link.style.cursor = '';
        }
    });
    const logoLink = document.querySelector('nav a[data-link][href="/"]');
    if (logoLink) {
        if (!token) {
            logoLink.classList.add('pointer-events-none', 'opacity-50');
            logoLink.setAttribute('aria-disabled', 'true');
            logoLink.style.cursor = 'not-allowed';
        }
        else {
            logoLink.classList.remove('pointer-events-none', 'opacity-50');
            logoLink.removeAttribute('aria-disabled');
            logoLink.style.cursor = '';
        }
    }
    const signOutBtn = document.getElementById('navbar-signout');
    if (signOutBtn) {
        signOutBtn.style.display = token ? 'block' : 'none';
        signOutBtn.innerText = translations[getCurrentLang()].logout;
    }
};
document.addEventListener("click", (event) => {
    const target = event.target;
    const linkElement = target.closest("[data-link]");
    if (linkElement) {
        event.preventDefault();
        navigateTo(linkElement.getAttribute("href"));
    }
});
window.addEventListener("popstate", renderPage);
const navRoutesForNavbar = {};
for (const key in routes) {
    if (key === "/")
        navRoutesForNavbar[key] = translations[getCurrentLang()].home;
    else if (key === "/pong")
        navRoutesForNavbar[key] = "Pong";
    else if (key === "/team")
        navRoutesForNavbar[key] = translations[getCurrentLang()].team;
}
const navbar = createNavbar(navRoutesForNavbar);
document.body.prepend(navbar);
window.renderPage = renderPage;
renderPage();

import './style.css';
import { createNavbar, getCurrentLang } from './components/navbar';
import { HomePage } from './pages/main';
import { LoginPage } from './pages/login';
import { translations } from './i18n';
const routes = {
    '/': HomePage,
    '/login': LoginPage,
};
export const navigateTo = (url) => {
    history.pushState(null, '', url);
    renderPage();
};
const renderPage = () => {
    const path = window.location.pathname;
    const pageRenderer = routes[path];
    let contentToRender;
    if (typeof pageRenderer === 'function') {
        contentToRender = pageRenderer();
    }
    else {
        const notFound = document.createElement('div');
        notFound.innerHTML = '<h1>404</h1><p>Page not found.</p>';
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
        }
        else {
            link.classList.remove('active');
        }
    });
};
document.addEventListener('click', event => {
    const target = event.target;
    const linkElement = target.closest('[data-link]');
    if (linkElement) {
        event.preventDefault();
        navigateTo(linkElement.getAttribute('href'));
    }
});
window.addEventListener('popstate', renderPage);
const navRoutesForNavbar = {
    '/': translations[getCurrentLang()].home,
    '/login': 'Login',
};
const navbar = createNavbar(navRoutesForNavbar);
document.body.prepend(navbar);
window.renderPage = renderPage;
renderPage();

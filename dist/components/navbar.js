import { translations } from '../i18n';
export function getCurrentLang() {
    return localStorage.getItem('lang') || 'en';
}
function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    if (typeof window.renderPage === 'function')
        window.renderPage();
}
const langDropdownContainer = document.createElement('div');
langDropdownContainer.style.position = 'relative';
langDropdownContainer.style.marginRight = '0.5rem';
const langButton = document.createElement('button');
langButton.type = 'button';
langButton.className = 'ml-2 p-1 bg-transparent border-none cursor-pointer flex items-center';
langButton.innerHTML = `<img src="/translate.png" alt="Lang" class="translate-icon" />`;
const langMenu = document.createElement('ul');
langMenu.className = 'absolute right-0 mt-2 bg-[#242424] rounded shadow-lg z-50 text-white border border-cyan-700';
langMenu.style.display = 'none';
langMenu.style.minWidth = '120px';
langMenu.style.listStyle = 'none';
langMenu.style.padding = '0';
const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
];
languages.forEach(lang => {
    const li = document.createElement('li');
    li.className = 'px-4 py-2 hover:bg-cyan-700 cursor-pointer';
    li.textContent = lang.label;
    li.onclick = () => {
        setLanguage(lang.code);
        langMenu.style.display = 'none';
    };
    langMenu.appendChild(li);
});
langButton.onclick = (e) => {
    e.stopPropagation();
    langMenu.style.display = langMenu.style.display === 'none' ? 'block' : 'none';
};
document.addEventListener('click', () => {
    langMenu.style.display = 'none';
});
langDropdownContainer.appendChild(langButton);
langDropdownContainer.appendChild(langMenu);
export function createNavbar(routes) {
    const nav = document.createElement('nav');
    nav.className = 'p-4 text-white flex justify-between items-center fixed top-0 left-0 right-0 w-full z-50 bg-[#242424]/75 backdrop-blur-sm';
    const leftItemsContainer = document.createElement('div');
    leftItemsContainer.className = 'absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-4';
    const textLogoLink = document.createElement('a');
    textLogoLink.href = '/';
    textLogoLink.setAttribute('data-link', '');
    textLogoLink.textContent = 'ft_transcendence';
    textLogoLink.className = `transition-all duration-300 hover:scale-90 transform font-bold text-sm md:text-base lg:text-xl`;
    leftItemsContainer.appendChild(textLogoLink);
    nav.appendChild(leftItemsContainer);
    const navLinks = document.createElement('div');
    navLinks.className = 'navbar-links';
    for (const path in routes) {
        const link = document.createElement('a');
        link.href = path;
        link.textContent = routes[path];
        link.setAttribute('data-link', '');
        link.className = `lg:text-lg transition-all duration-300 hover:text-[#C3BABA] hover:font-bold hover:scale-125 transform`;
        navLinks.appendChild(link);
    }
    nav.appendChild(navLinks);
    const rightItemsContainer = document.createElement('div');
    rightItemsContainer.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-4';
    rightItemsContainer.appendChild(langDropdownContainer);
    nav.appendChild(rightItemsContainer);
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-btn';
    hamburgerBtn.innerHTML = '☰';
    hamburgerBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
    nav.appendChild(hamburgerBtn);
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            navLinks.classList.remove('open');
        }
    });
    if (window.innerWidth >= 768) {
        navLinks.classList.remove('open');
    }
    return nav;
}

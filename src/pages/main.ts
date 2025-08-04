import '../style.css';
import { translations } from '../i18n';
import { getCurrentLang } from '../components/navbar';

export function HomePage(): HTMLElement {
	const mainContainer = document.createElement('div');
	mainContainer.className = 'Parent p-5';

	const titleContainer = document.createElement('div');
	titleContainer.className = 'w-full text-center mt-4';

	const pageTitle = document.createElement('h1');
    pageTitle.className = `
        text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
        from-purple-500 via-pink-500 to-cyan-400 
        tracking-wide
        [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.5))_drop-shadow(0_2px_2px_rgba(0,0,0,0.3))]
        md:text-6xl
        inline-block 
    `;

    pageTitle.textContent = translations[getCurrentLang()].welcome + " " + translations[getCurrentLang()].play;

	titleContainer.appendChild(pageTitle);
	
	mainContainer.appendChild(titleContainer);
	
	return mainContainer;
}
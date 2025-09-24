import { getCurrentLang } from "./settings";
import { translations } from "../i18n";

export function CreditsPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "text-white min-h-screen w-full flex flex-col justify-center gap-3 items-center";
	mainContainer.style.backgroundImage = "url('/swenn.jpg')";
	// mainContainer.style.backgroundSize = "100% 100%";
	mainContainer.style.backgroundPosition = "center";
	// mainContainer.style.backgroundRepeat = "no-repeat";

	const title = document.createElement("h1");
	title.textContent = "Credits";
	title.className = "absolute top-40 text-6xl font-bold drop-shadow-lg";
	mainContainer.appendChild(title);

	const div = document.createElement("div");
	div.className = "glass-blur w-1/2 h-1/2 flex flex-col justify-between gap-6 p-6 items-center";
	mainContainer.appendChild(div);

	{// Ilan
		const txt = document.createElement('p');
		txt.textContent = "Ilan(Inowak--): Front";
		txt.className = "text-4xl font-bold drop-shadow-lg";
		div.appendChild(txt);
	}
	{// Antoine
		const txt = document.createElement('p');
		txt.textContent = "Antoine(Antauber): Devops";
		txt.className = "text-4xl font-bold drop-shadow-lg";
		div.appendChild(txt);
	}
	{// Yolan
		const txt = document.createElement('p');
		txt.textContent = "Yolan(Ygorget): Back";
		txt.className = "text-4xl font-bold drop-shadow-lg";
		div.appendChild(txt);
	}

	return mainContainer;
}
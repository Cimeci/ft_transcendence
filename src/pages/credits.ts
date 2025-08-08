import { getCurrentLang } from "./settings";
import { translations } from "../i18n";

export function CreditsPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "text-white min-h-screen w-full flex justify-center items-center";
	mainContainer.style.backgroundImage = "url('/swenn.jpg')";
	// mainContainer.style.backgroundSize = "cover";
	mainContainer.style.backgroundPosition = "center";
	// mainContainer.style.backgroundRepeat = "no-repeat";

	const text = document.createElement("h1");
	text.textContent = "Credits";
	text.className = "text-6xl font-bold drop-shadow-lg";
	mainContainer.appendChild(text);

	return mainContainer;
}
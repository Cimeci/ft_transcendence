import { getCurrentLang } from "../pages/settings";
import { translations } from '../i18n';

export function ShopPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	 mainContainer.className = "min-h-screen w-full bg-purple-300 flex flex-col items-center justify-center gap-4";

	const title = document.createElement("h2");
	title.textContent = translations[getCurrentLang()].shop;
	title.className = "fixed top-0 p-6 z-1000";
	mainContainer.appendChild(title);

	const shopContainer = document.createElement("div");
	shopContainer.className = "shop-grid";

	const lstImg = [
		'/public/bar/default_bar.png',
		'/public/bar/fire_bar.png',
		'/public/bar/ice_bar.png',
		'/public/bar/amethyst_bar.png'
	];

	const lstNameImg = [
		'default_bar',
		'fire_bar',
		'ice_bar',
		'amethyst_bar',
	];

	for (let i = 0; i < lstImg.length; i++) {
		const item = document.createElement("div");
		item.className = "flex border-4 rounded grid justify-center text-center m-5 gap-5";
		
		const image = document.createElement("img");
		image.src = lstImg[i];
		image.className = "size-90";
		item.appendChild(image);
	
		const price = document.createElement("p");
		price.textContent = "1080 $"
		price.className = "border-3 text-3xl";
		item.appendChild(price);

		const name = document.createElement("a");
		name.textContent = translations[getCurrentLang()][lstNameImg[i] as keyof typeof translations['en']];
		name.className = "m-2 text-4xl cursor-pointer";
		item.appendChild(name);

		item.addEventListener("click", () => {
			name.className = "text-green-500 text-4xl";
			name.textContent = "Buy";
			setTimeout(() => {
				name.textContent = translations[getCurrentLang()][lstNameImg[i] as keyof typeof translations['en']];
				name.className = "text-4xl cursor-pointer";

			}, 600);
		});

		shopContainer.appendChild(item);
	}

	mainContainer.appendChild(shopContainer);
	return mainContainer;
}
import { getCurrentLang } from "../pages/settings";
import { translations } from '../i18n';

export function ShopPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "bg-purple-300 flex flex-col items-center pt-40 h-screen gap-4";
	
	const title = document.createElement("h2");
	title.textContent = translations[getCurrentLang()].shop;
	mainContainer.appendChild(title);

	const shopContainer = document.createElement("div");
	shopContainer.className = "shop-grid";

	const lstImg = [
		'/public/default_bar.png',
		'/public/fire_bar.png',
		'/public/ice_bar.png',
	];

	const lstNameImg = [
		'default_bar',
		'fire_bar',
		'ice_bar',
	];

	for (let i = 0; i < lstImg.length; i++) {
		const item = document.createElement("div");
		item.className = "flex border-4 rounded grid justify-center text-center m-5 gap-5";
		
		const image = document.createElement("img");
		image.src = lstImg[i];
		image.className = "size-90";
		item.appendChild(image);
	
		const price = document.createElement("p");
		price.textContent = "80 $"
		price.className = "border-3 text-3xl";
		item.appendChild(price);

		const name = document.createElement("a");
		name.textContent = translations[getCurrentLang()][lstNameImg[i] as keyof typeof translations['en']];
		name.className = "m-2 text-4xl cursor-pointer";
		item.appendChild(name);

		// const buyMsg = document.createElement("div");
		// buyMsg.className = "text-green-500 text-lg mt-2";
		// buyMsg.style.display = "none";
		// buyMsg.textContent = translations[getCurrentLang()].play + " effectué !";
		// item.appendChild(buyMsg);

		item.addEventListener("click", () => {
			name.className = "text-green-500 text-4xl";
			name.textContent = "Buy";
			setTimeout(() => {
				name.textContent = translations[getCurrentLang()][lstNameImg[i] as keyof typeof translations['en']];
				name.className = "text-4xl cursor-pointer";
			}, 2000);
		});

		shopContainer.appendChild(item);
	}

	mainContainer.appendChild(shopContainer);
	return mainContainer;
}
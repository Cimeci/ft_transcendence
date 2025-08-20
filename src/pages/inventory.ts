import { getCurrentLang } from "../pages/settings";
import { translations } from '../i18n';

export type CosmeticType = 'avatar' | 'background' | 'bar' | 'ball';

export interface CosmeticItem {
	src?: string;
    id: string;
    name: string;
	type: CosmeticType;
};

export interface Inventory {
    [type: string]: CosmeticItem[];
}

export let userName: string = "default";

export const userInventory: Inventory = {
	avatar: [
        { id: 'avatar/default_avatar.png', name: 'default avatar', type: 'avatar'},
        { id: 'avatar/inowak--.jpg', name: 'inowak-- avatar', type: 'avatar'},
		{ id: 'avatar/mdegache.jpg', name: 'mdegache avatar', type: 'avatar'},
		{ id: 'avatar/amblanch.jpg', name: 'amblanch avatar', type: 'avatar'},
		{ id: 'avatar/alaualik.jpg', name: 'alaualik avatar', type: 'avatar'},
		{ id: 'avatar/rgramati.jpg', name: 'rgramati avatar', type: 'avatar'},
		{ id: 'avatar/jodougla.jpg', name: 'jodougla avatar', type: 'avatar'},
    ],
	background: [
		{ id: 'bg/transparent_bg.png', name: 'transparent bg', type: 'background'},
		{ id: 'bg/transparent_bg.png', name: 'transparent bg', type: 'background'},
        { id: 'bg/default_bg.png', name: 'default bg', type: 'background'},
		{ id: 'bg/matrix_bg.gif', name: 'matrix bg', type: 'background'},
    ],
    bar: [
        { src: 'playbar/default_bar.png' ,id: 'bar/default_bar.png', name: 'default bar', type: 'bar'},
        { src: 'playbar/default_bar.png', id: 'bar/default_bar.png', name: 'default bar', type: 'bar'},
        { src: 'playbar/ice_bar.png', id: 'bar/ice_bar.png', name: 'ice bar', type: 'bar'},
        { src: 'playbar/fire_bar.png', id: 'bar/fire_bar.png', name: 'fire bar', type: 'bar'},
		{ src: 'playbar/amethyst_bar.png', id: 'bar/amethyst_bar.png', name: 'amethyst bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},
		{ src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar'},


    ],
	ball: [
		{ id: 'ball/default_ball.png', name: 'default_ball', type: 'ball'},
		{ id: 'ball/default_ball.png', name: 'default_ball', type: 'ball'},
		{ id: 'ball/tennis_ball.png', name: 'tennis_ball', type: 'ball'},
	],
};

// Gestion exclusive des pages (une ouverte à la fois)
const pagesRegistry: HTMLElement[] = [];
const registerPage = (p: HTMLElement) => pagesRegistry.push(p);
const togglePageExclusive = (target: HTMLElement) => {
	// ouvre target et ferme toutes les autres
	const willOpen = target.style.display !== "grid";
	pagesRegistry.forEach(p => (p.style.display = "none"));
	target.style.display = willOpen ? "grid" : "none";
};

function CreateAvatarContainer(inventory: Inventory, inventoryContainer: HTMLElement): HTMLElement {
	const  AvatarContainer = document.createElement("div");
	AvatarContainer.className = "transition-all duration-300 hover:scale-105 z-2 flex border-6 rounded grid justify-center text-center m-5";
	
	const TypeContainer = document.createElement("p");
	TypeContainer.textContent = inventory.avatar[0].type;
	TypeContainer.className = "border-3 tracking-widest text-2xl p-2"
	AvatarContainer.appendChild(TypeContainer);

	const PrincipalImgAvatar = document.createElement("img");
	PrincipalImgAvatar.src = inventory.avatar[0].id;
	PrincipalImgAvatar.className = "cursor-pointer size-80 p-2 object-cover";
	AvatarContainer.appendChild(PrincipalImgAvatar);

	inventoryContainer.appendChild(AvatarContainer);

	const AvatarPage = document.createElement("div");
	AvatarPage.className = "inventory-grid gap-8";
	AvatarPage.style.display = "none";
	registerPage(AvatarPage);

	for (let i = 1; i < inventory.avatar.length; i++)
	{
		const itemAvatar = document.createElement("div");
		itemAvatar.className = "border-8 justify-center text-center items-center gap-2";

		const imgAvatar = document.createElement("img");
		imgAvatar.src = inventory.avatar[i].id;
		imgAvatar.className = "border-2 cursor-pointer size-90 m-2 object-cover"

		const nameAvatar = document.createElement("p");
		nameAvatar.textContent = inventory.avatar[i].name;
		nameAvatar.className = "tracking-widest text-2xl p-2";

		itemAvatar.appendChild(imgAvatar);
		itemAvatar.appendChild(nameAvatar);
		AvatarPage.appendChild(itemAvatar);

		
		imgAvatar.addEventListener("click", () => {
			if (i != 0)
			{
        	    inventory.avatar[0] = inventory.avatar[i];

        	    PrincipalImgAvatar.src = inventory.avatar[0].id;
        	    TypeContainer.textContent = inventory.avatar[0].type;

        	    AvatarPage.style.display = "none";
			}
    	});
	}

	PrincipalImgAvatar.addEventListener("click", () => {
		togglePageExclusive(AvatarPage);
	})
	return AvatarPage;
}

function CreateBackgroundContainer(inventory: Inventory, inventoryContainer: HTMLElement): HTMLElement {

	const  backgroundContainer = document.createElement("div");
	backgroundContainer.className = "transition-all duration-300 hover:scale-105 z-2 flex border-6 rounded grid justify-center text-center m-5";
	
	const TypeContainer = document.createElement("p");
	TypeContainer.textContent = inventory.background[0].type;
	TypeContainer.className = "border-3 tracking-widest text-2xl p-2"
	backgroundContainer.appendChild(TypeContainer);

	const PrincipalImgbackground = document.createElement("img");
	PrincipalImgbackground.src = inventory.background[0].id;
	PrincipalImgbackground.className = "cursor-pointer size-80 p-2 object-cover";
	backgroundContainer.appendChild(PrincipalImgbackground);

	inventoryContainer.appendChild(backgroundContainer);

	const backgroundPage = document.createElement("div");
	backgroundPage.className = "inventory-grid gap-8";
	backgroundPage.style.display = "none";
	registerPage(backgroundPage);

	for (let i = 1; i < inventory.background.length; i++)
	{
		const itembackground = document.createElement("div");
		itembackground.className = "border-8 justify-center text-center items-center gap-2";

		const imgbackground = document.createElement("img");
		imgbackground.src = inventory.background[i].id;
		imgbackground.className = "border-2 cursor-pointer size-90 m-2 object-cover"

		const namebackground = document.createElement("p");
		namebackground.textContent = inventory.background[i].name;
		namebackground.className = "tracking-widest text-2xl p-2";

		itembackground.appendChild(imgbackground);
		itembackground.appendChild(namebackground);
		backgroundPage.appendChild(itembackground);

		
		imgbackground.addEventListener("click", () => {
			if (i != 0)
			{
        	    inventory.background[0] = inventory.background[i];

        	    PrincipalImgbackground.src = inventory.background[0].id;
        	    TypeContainer.textContent = inventory.background[0].type;

        	    backgroundPage.style.display = "none";
			}
    	});
	}

	PrincipalImgbackground.addEventListener("click", () => {
		togglePageExclusive(backgroundPage);
	})
	return backgroundPage;
}

function CreateBarContainer(inventory: Inventory, inventoryContainer: HTMLElement): HTMLElement {
	const  barContainer = document.createElement("div");
	barContainer.className = "ftransition-all duration-300 hover:scale-105 lex border-6 rounded grid justify-center text-center m-5";
	
	const TypeContainer = document.createElement("p");
	TypeContainer.textContent = inventory.bar[0].type;
	TypeContainer.className = "border-4 tracking-widest text-2xl p-2"
	barContainer.appendChild(TypeContainer);

	const PrincipalImgbar = document.createElement("img");
	PrincipalImgbar.src = inventory.bar[0].id;
	PrincipalImgbar.className = "cursor-pointer size-80 p-2 object-cover";
	barContainer.appendChild(PrincipalImgbar);

	inventoryContainer.appendChild(barContainer);

	const barPage = document.createElement("div");
	barPage.className = "inventory-grid gap-8";
	barPage.style.display = "none";
	registerPage(barPage);

	for (let i = 1; i < inventory.bar.length; i++)
	{
		const itembar = document.createElement("div");
		itembar.className = "border-8 justify-center text-center items-center gap-2";

		const imgbar = document.createElement("img");
		imgbar.src = inventory.bar[i].id;
		imgbar.className = "border-2 cursor-pointer size-90 m-2 object-cover"

		const namebar = document.createElement("p");
		namebar.textContent = inventory.bar[i].name;
		namebar.className = "tracking-widest text-2xl p-2";

		itembar.appendChild(imgbar);
		itembar.appendChild(namebar);
		barPage.appendChild(itembar);

		
		imgbar.addEventListener("click", () => {
			if (i != 0)
			{
        	    inventory.bar[0] = inventory.bar[i];

        	    PrincipalImgbar.src = inventory.bar[0].id;
        	    TypeContainer.textContent = inventory.bar[0].type;

        	    barPage.style.display = "none";
			}
    	});
	}

	PrincipalImgbar.addEventListener("click", () => {
		togglePageExclusive(barPage);
	})
	return barPage;
}

function CreateBallContainer(inventory: Inventory, inventoryContainer: HTMLElement): HTMLElement {
	const  ballContainer = document.createElement("div");
	ballContainer.className = "transition-all duration-300 hover:scale-105 z-2 flex border-6 rounded grid justify-center text-center m-5";
	
	const TypeContainer = document.createElement("p");
	TypeContainer.textContent = inventory.ball[0].type;
	TypeContainer.className = "border-3 tracking-widest text-2xl p-2"
	ballContainer.appendChild(TypeContainer);

	const PrincipalImgball = document.createElement("img");
	PrincipalImgball.src = inventory.ball[0].id;
	PrincipalImgball.className = "cursor-pointer size-80 p-2 object-cover";
	ballContainer.appendChild(PrincipalImgball);

	inventoryContainer.appendChild(ballContainer);

	const ballPage = document.createElement("div");
	ballPage.className = "inventory-grid gap-8";
	ballPage.style.display = "none";
	registerPage(ballPage);

	for (let i = 1; i < inventory.ball.length; i++)
	{
		const itemball = document.createElement("div");
		itemball.className = "border-4 justify-center text-center items-center gap-2";

		const imgball = document.createElement("img");
		imgball.src = inventory.ball[i].id;
		imgball.className = "border-2 cursor-pointer size-90 m-2 object-cover"

		const nameball = document.createElement("p");
		nameball.textContent = inventory.ball[i].name;
		nameball.className = "tracking-widest text-2xl p-2";

		itemball.appendChild(imgball);
		itemball.appendChild(nameball);
		ballPage.appendChild(itemball);

		
		imgball.addEventListener("click", () => {
			if (i != 0)
			{
        	    inventory.ball[0] = inventory.ball[i];

        	    PrincipalImgball.src = inventory.ball[0].id;
        	    TypeContainer.textContent = inventory.ball[0].type;

        	    ballPage.style.display = "none";
			}
    	});
	}

	PrincipalImgball.addEventListener("click", () => {
		togglePageExclusive(ballPage);
	})
	return ballPage;
}

export function InventoryPage(): HTMLElement {
    const mainContainer = document.createElement("div");
    mainContainer.className = "pt-25 min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-linear-to-t from-green-500 via-black to-green-800"
	
	const title = document.createElement("h2");
	title.textContent = translations[getCurrentLang()].inventory;
	title.className = "fixed top-0 p-6 z-1000";
	mainContainer.appendChild(title);

	// Input username compact, centré
	const nameForm = document.createElement("form");
	nameForm.className = "w-full max-w-md mx-auto mt-6";
	const nameWrap = document.createElement("div");
	nameWrap.className = "relative";
	const nameLabel = document.createElement("label");
	nameLabel.htmlFor = "username-input";
	nameLabel.className = "mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white";
	nameLabel.textContent = translations[getCurrentLang()].username ?? "Username";
	nameWrap.appendChild(nameLabel);
	const nameInput = document.createElement("input");
	nameInput.type = "text";
	nameInput.id = "username-input";
	nameInput.value = userName;
	nameInput.placeholder = (translations[getCurrentLang()].username ?? "Username") + "...";
	nameInput.className = "block w-full p-3 pe-24 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 " +
		"focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 " +
		"dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500";
	nameWrap.appendChild(nameInput);
	const nameBtn = document.createElement("button");
	nameBtn.type = "submit";
	nameBtn.className = "text-white absolute end-2.5 top-1/2 -translate-y-1/2 bg-green-700 hover:bg-green-800 " +
		"focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-2 " +
		"dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800";
	nameBtn.textContent = translations[getCurrentLang()].apply;
	nameWrap.appendChild(nameBtn);
	nameForm.appendChild(nameWrap);
	nameForm.addEventListener("submit", (e) => {
		e.preventDefault();
		const v = nameInput.value.trim();
		if (v) userName = v;
	});
	mainContainer.appendChild(nameForm);

    const inventory = userInventory;
    const inventoryContainer = document.createElement("div");
    inventoryContainer.className = "inventory-grid z-1";

    mainContainer.appendChild(CreateAvatarContainer(inventory, inventoryContainer));

    mainContainer.appendChild(CreateBackgroundContainer(inventory, inventoryContainer));

    mainContainer.appendChild(CreateBarContainer(inventory, inventoryContainer));

    mainContainer.appendChild(CreateBallContainer(inventory, inventoryContainer));


    mainContainer.appendChild(inventoryContainer);
    return (mainContainer);
}
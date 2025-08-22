import { getCurrentLang } from "../pages/settings";
import { translations } from '../i18n';

export type CosmeticType = 'avatar' | 'background' | 'bar' | 'ball';

export interface CosmeticItem {
    src?: string;
    id: string;
    name: string;
    type: CosmeticType;
};
export interface Inventory { [type: string]: CosmeticItem[]; }

export let userName: string = "default";

export const userInventory: Inventory = {
    avatar: [
        { id: 'avatar/default_avatar.png', name: 'default avatar', type: 'avatar'},
        { id: 'avatar/default_avatar.png', name: 'default avatar', type: 'avatar'},
        { id: 'avatar/inowak--.jpg', name: 'inowak-- avatar', type: 'avatar'},
        { id: 'avatar/mdegache.jpg', name: 'mdegache avatar', type: 'avatar'},
        { id: 'avatar/amblanch.jpg', name: 'amblanch avatar', type: 'avatar'},
        { id: 'avatar/alaualik.jpg', name: 'alaualik avatar', type: 'avatar'},
        { id: 'avatar/rgramati.jpg', name: 'rgramati avatar', type: 'avatar'},
        { id: 'avatar/jodougla.jpg', name: 'jodougla avatar', type: 'avatar'},
        { id: 'avatar/ael-atmi.jpg', name: 'ael-atmi avatar', type: 'avatar'},
        { id: 'avatar/pjurdana.jpg', name: 'pjurdana avatar', type: 'avatar'},
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
    ],
    ball: [
        { id: 'ball/default_ball.png', name: 'default_ball', type: 'ball'},
        { id: 'ball/default_ball.png', name: 'default_ball', type: 'ball'},
        { id: 'ball/tennis_ball.png', name: 'tennis_ball', type: 'ball'},
    ],
};

/* ---- Événement profil (navbar / user page) ---- */
function emitProfileUpdate() {
    window.dispatchEvent(new CustomEvent('profile:update', {
        detail: {
            userName,
            avatar: userInventory.avatar?.[0]?.id,
            background: userInventory.background?.[0]?.id,
            bar: userInventory.bar?.[0]?.id,
            ball: userInventory.ball?.[0]?.id
        }
    }));
}

/* ---- Page ---- */
export function InventoryPage(): HTMLElement {
    const lang = getCurrentLang();
	// @ts-ignore
    const t = (k: string, fallback?: string) => (translations[lang] && translations[lang][k]) || fallback || k;

    const main = document.createElement("div");
    main.className = "w-full min-h-screen bg-linear-to-t from-green-500 via-black to-green-800 pt-30 flex flex-col items-center";

    /* Titre */
    const title = document.createElement("h2");
    title.textContent = t("inventory","Inventory");
    title.className = "tracking-widest fixed top-0 p-6 z-1000";
    main.appendChild(title);

    /* Layout principal: gauche (visuel) / droite (liste) */
    const layout = document.createElement("div");
    layout.className = "w-8/10 flex flex-col lg:flex-row gap-5";
    main.appendChild(layout);

    const left = document.createElement("div");
    left.className = "w-2/5 flex flex-col gap-4";

    /* Form username */
    const nameForm = document.createElement("form");
    nameForm.className = "w-full max-w-lg mb-8";

    const nameWrap = document.createElement("div");
    nameWrap.className = "relative";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = userName;
    nameInput.placeholder = t("username","Username")+"...";
    nameInput.className = "block w-full p-3 pe-28 text-sm border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500";
    
	const nameBtn = document.createElement("button");
    nameBtn.type = "submit";
    nameBtn.textContent = t("apply","Apply");
    nameBtn.className = "absolute top-1/2 -translate-y-1/2 right-2 px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-sm font-medium";
    
   	function applyUserName() {
   	    const v = nameInput.value.trim();
   	    if (v && v !== userName) {
   	        userName = v;
   	        emitProfileUpdate();
   	    }
   	}

	nameWrap.appendChild(nameInput); nameWrap.appendChild(nameBtn); nameForm.appendChild(nameWrap);
	nameForm.addEventListener("submit",(e)=>{
		if (nameInput.value.trim() == "") {nameInput.placeholder = translations[getCurrentLang()].empty_input}
		else {
        	e.preventDefault();
        	applyUserName();
		}
    });
    nameInput.addEventListener("keydown", (e)=>{
        if (e.key === "Enter") {
			if (nameInput.value.trim() == "") {nameInput.placeholder = translations[getCurrentLang()].empty_input}
			else {
            	e.preventDefault();
            	applyUserName();
			}
        }
    });
    left.appendChild(nameForm);

    function makePreviewBox(label: string, type: CosmeticType): {box: HTMLElement, img: HTMLImageElement} {
        const box = document.createElement("div");
        box.className = "h-full w-full bg-white/10 border border-white/15 rounded-xl p-2 flex flex-col items-center gap-3";
    	 
		const header = document.createElement("div");
    	header.textContent = label;
    	header.className = "w-full text-xs sm:text-sm tracking-wide font-semibold text-white text-center bg-white/10 rounded px-2 py-1";
        	
		const img = document.createElement("img");
        img.src = userInventory[type]?.[0]?.id;
        img.alt = type;
        img.className = "size-8/10 aspect-square object-cover rounded-lg bg-black/40";
        
		box.appendChild(header); box.appendChild(img);
        return { box, img };
    }

    const previewAvatar = makePreviewBox(t("Avatar","Avatar"),"avatar");
    const previewBackground = makePreviewBox(t("Background","Background"),"background");
    const previewBar = makePreviewBox(t("Bar","Bar"),"bar");
    const previewBall = makePreviewBox(t("Ball","Ball"),"ball");

	const actualInventory = document.createElement("div");
	actualInventory.className = "grid grid-cols-2 grid-rows-2 gap-4"

    actualInventory.appendChild(previewAvatar.box);
    actualInventory.appendChild(previewBackground.box);
    actualInventory.appendChild(previewBar.box);
    actualInventory.appendChild(previewBall.box);
	left.appendChild(actualInventory);
    layout.appendChild(left);

    function updateLeft() {
        previewAvatar.img.src = userInventory.avatar?.[0]?.id;
        previewBackground.img.src = userInventory.background?.[0]?.id;
        previewBar.img.src = userInventory.bar?.[0]?.id;
        previewBall.img.src = userInventory.ball?.[0]?.id;
    }
    /* ---- Colonne droite: filtres + liste ---- */
    const right = document.createElement("div");
    right.className = "w-3/5 flex flex-col bg-white/10 border border-white/15 rounded-xl min-h-0";

    /* Filtres */
    const filters = document.createElement("div");
    filters.className = "flex flex-col md:flex-row gap-3 md:items-center px-4 pt-4";
    const select = document.createElement("select");
    select.className = "px-3 py-2 rounded-md bg-green-600 border rounded-lg border-white/20 text-sm text-white focus:outline-none";
    [
        {v:"all", l:t("all","All")},
        {v:"avatar", l:t("Avatar","Avatar")},
        {v:"background", l:t("Background","Background")},
        {v:"bar", l:t("Bar","Bar")},
        {v:"ball", l:t("Ball","Ball")},
    ].forEach(o=>{
        const opt = document.createElement("option");
        opt.value=o.v; opt.textContent=o.l; select.appendChild(opt);
    });
    const search = document.createElement("input");
    search.type="text";
    search.placeholder = t("search","Search")+"...";
    search.className = "flex-1 px-3 py-2 rounded-md bg-black/40 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none";
    filters.appendChild(select);
    filters.appendChild(search);
    right.appendChild(filters);

    /* Grille */
    const listWrap = document.createElement("div");
    listWrap.className = "mt-4 p-4 pt-2 flex-1 overflow-y-auto inventory-scroll min-h-0";
    const grid = document.createElement("div");
    grid.className = "grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
    listWrap.appendChild(grid);
    right.appendChild(listWrap);
    layout.appendChild(right);

    /* État filtre */
    let currentType: 'all'|CosmeticType = 'all';
    let query = "";

    select.addEventListener("change", ()=>{
        currentType = select.value as any;
        renderGrid();
    });
    search.addEventListener("input", ()=>{
        query = search.value.toLowerCase();
        renderGrid();
    });

    /* Swap d’un item vers index 0 */
    function equipItem(type: CosmeticType, idx: number) {
        if (idx <= 0) return;
        const arr = userInventory[type];
        if (!arr || idx >= arr.length) return;
        arr[0] = arr[idx];
        updateLeft();
        emitProfileUpdate();
        renderGrid(); // rafraîchir highlight
    }

    /* Rendu liste */
    function renderGrid() {
        grid.innerHTML = "";
        const types: CosmeticType[] = ["avatar","background","bar","ball"];
        types.forEach(type=>{
            if (currentType !== "all" && currentType !== type) return;
            const items = userInventory[type];
            items.forEach((item, i)=>{
                if (i === 0) return; // Ne pas afficher l'item équipé (index 0)
                if (query && !item.name.toLowerCase().includes(query)) return;
                const cell = document.createElement("button");
                cell.type="button";
                cell.className = "relative group rounded-lg border border-white/15 bg-black/40 hover:bg-black/60 transition p-1 flex flex-col items-center";
                const img = document.createElement("img");
                img.src = item.id;
                img.alt = item.name;
                img.className = "w-full aspect-square object-cover rounded-md";
                const cap = document.createElement("span");
                cap.textContent = item.name;
                cap.className = "w-full mt-1 text-[10px] leading-tight text-white/80 text-center truncate";
                cell.appendChild(img);
                cell.appendChild(cap);
                cell.addEventListener("click", ()=> equipItem(type, i));
                grid.appendChild(cell);
            });
        });
    }
    renderGrid();

    /* Hauteur dynamique scroll */
    function adjustListHeight() {
        // Position actuelle du haut de la zone de liste dans la fenêtre
        const rect = listWrap.getBoundingClientRect();
        const top = rect.top;
        const marginBottom = 32; // marge bas
        const available = window.innerHeight - top - marginBottom;
        if (available > 200) {
            listWrap.style.maxHeight = available + "px";
        } else {
            listWrap.style.maxHeight = "200px";
        }
    }
    // Attendre un tick pour que le layout soit stable
    requestAnimationFrame(adjustListHeight);
    window.addEventListener("resize", adjustListHeight);
    window.addEventListener("orientationchange", adjustListHeight);

    /* Expose pour MAJ externe éventuelle */
    (window as any).refreshInventoryGrid = renderGrid;

    return main;
}
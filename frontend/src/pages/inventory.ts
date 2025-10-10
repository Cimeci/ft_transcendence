import { getCurrentLang } from "./settings";
import { translations } from '../i18n';
import { emitProfileUpdate } from './settings';

export type CosmeticType = 'avatar' | 'background' | 'bar' | 'ball';

export interface CosmeticItem {
    src?: string;
    id: string;
    name: string;
    type: CosmeticType;
    price: number;
};
export interface Inventory { [type: string]: CosmeticItem[]; }

export const userInventory: Inventory = {
    avatar: [
        { id: 'avatar/default_avatar.png', name: 'default avatar', type: 'avatar', price: 250},
        { id: 'avatar/default_avatar.png', name: 'default avatar', type: 'avatar', price: 250},
        { id: 'avatar/inowak--.jpg', name: 'inowak-- avatar', type: 'avatar', price: 250},
        { id: 'avatar/mdegache.jpg', name: 'mdegache avatar', type: 'avatar', price: 250},
        { id: 'avatar/amblanch.jpg', name: 'amblanch avatar', type: 'avatar', price: 250},
        { id: 'avatar/alaualik.jpg', name: 'alaualik avatar', type: 'avatar', price: 250},
        { id: 'avatar/xavierchad.gif', name: 'xavierchad avatar', type: 'avatar', price: 250},
        { id: 'avatar/jodougla.jpg', name: 'jodougla avatar', type: 'avatar', price: 250},
        { id: 'avatar/ael-atmi.jpg', name: 'ael-atmi avatar', type: 'avatar', price: 250},
        { id: 'avatar/pjurdana.jpg', name: 'pjurdana avatar', type: 'avatar', price: 250},
        { id: 'avatar/rgodet.jpg', name: 'rgodet avatar', type: 'avatar', price: 250},
    ],
    background: [
        { id: 'bg/default_bg.png', name: 'default bg', type: 'background', price: 250},
        { id: 'bg/default_bg.png', name: 'default bg', type: 'background', price: 250},
        { id: 'bg/transcendence_bg.png', name: 'transcendence bg', type: 'background', price: 250},
        { id: 'bg/matrix_bg.gif', name: 'matrix bg', type: 'background', price: 250},
    ],
    bar: [
        { src: 'playbar/default_bar.png' ,id: 'bar/default_bar.png', name: 'default bar', type: 'bar', price: 250},
        { src: 'playbar/default_bar.png', id: 'bar/default_bar.png', name: 'default bar', type: 'bar', price: 250},
        { src: 'playbar/ice_bar.png', id: 'bar/ice_bar.png', name: 'ice bar', type: 'bar', price: 250},
        { src: 'playbar/fire_bar.png', id: 'bar/fire_bar.png', name: 'fire bar', type: 'bar', price: 250},
        { src: 'playbar/amethyst_bar.png', id: 'bar/amethyst_bar.png', name: 'amethyst bar', type: 'bar', price: 250},
        { src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar', price: 250},
        { src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar', price: 250},
        { src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar', price: 250},
        { src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar', price: 250},
        { src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar', price: 250},
    ],
    ball: [
        { id: 'ball/default_ball.png', name: 'default ball', type: 'ball', price: 250},
        { id: 'ball/default_ball.png', name: 'default ball', type: 'ball', price: 250},
        { id: 'ball/tennis_ball.png', name: 'tennis ball', type: 'ball', price: 250},
        { id: 'ball/swenn_ball.gif', name: 'swenn ball', type: 'ball', price: 250},
    ],
};

async function getInventory() {
  const token = localStorage.getItem('jwt');

  const res = await fetch('/user/inventory', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('err Inventory');

  const data = await res.json();
  return data.filteredInventory;
}

/* ---- Page ---- */
export function InventoryPage(): HTMLElement {
    const lang = getCurrentLang();
	// @ts-ignore
    const t = (k: string, fallback?: string) => (translations[lang] && translations[lang][k]) || fallback || k;

    const main = document.createElement("div");
    main.className = "w-full min-h-screen bg-linear-to-t from-green-500 via-black to-green-800 pt-30 flex flex-col items-center lg:overflow-hidden";

    /* Titre */
    const title = document.createElement("h2");
    title.textContent = t("inventory","Inventory");
    title.className = "tracking-widest fixed top-0 p-6 z-1000";
    main.appendChild(title);

    /* Layout principal: gauche (visuel) / droite (liste) */
    const layout = document.createElement("div");
    layout.className = "w-19/20 lg:w-9/10 xl:w-8/10 flex flex-col xl:flex-row gap-5 items-center xl:items-stretch min-h-0 justify-center";
    main.appendChild(layout);

    const left = document.createElement("div");
    left.className = "items-center w-8/10 xl:w-2/6 min-h-0 h-full flex flex-col overflow-hidden mx-auto xl:mx-0";

    /* Form username */

    async function displayInventoryPreview() {
        const inventory = await getInventory();
    
        const actualInventory = document.createElement("div");
        actualInventory.className = "grid grid-cols-4 xl:grid-cols-2 grid-rows-1 xl:grid-rows-2 gap-4 h-full";
    
        const previewAvatar = makePreviewBox("Avatar", "avatar", inventory);
        const previewBackground = makePreviewBox("Background", "background", inventory);
        const previewBar = makePreviewBox("Bar", "paddle", inventory);
        const previewBall = makePreviewBox("Ball", "ball", inventory);
    
        actualInventory.appendChild(previewAvatar);
        actualInventory.appendChild(previewBackground);
        actualInventory.appendChild(previewBar);
        actualInventory.appendChild(previewBall);
    
        left.appendChild(actualInventory);
        layout.appendChild(left);
    }
    
    function makePreviewBox(label: string, type: string, inventory: any): HTMLElement {
        const box = document.createElement("div");
        box.className = "h-full w-full bg-white/10 border border-white/15 rounded-xl p-2 flex flex-col items-center gap-3";
    
        const header = document.createElement("div");
        header.textContent = label;
        header.className = "w-full max-w-full text-xs sm:text-sm tracking-wide font-semibold text-white text-center bg-white/10 rounded px-2 py-1 truncate";
        header.title = label;
    
        const img = document.createElement("img");
        const key = `${type}_use`;
        img.src = `${inventory[key][0].id}`;
        img.alt = type;
        img.className = "w-full aspect-square object-cover rounded-lg bg-black/40 mt-2 sm:mt-5 xl:mt-10";
    
        box.appendChild(header);
        box.appendChild(img);
        return box;
    }

    displayInventoryPreview();

    // async function changeBackground(newBgName: string) {
    //     const token = localStorage.getItem('jwt');

    //     const res = await fetch('user/inventory-use', {
    //         method: 'PATCH',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${token}`,
    //         },
    //         body: JSON.stringify({
    //             background_use: newBgName,
    //         }),
    //     });
    
    //     if (!res.ok) {
    //         const error = await res.json();
    //         console.error('Erreur :', error);
    //         return;
    //     }
    // }

    /* ---- Colonne droite: filtres + liste ---- */
    // const right = document.createElement("div");
    // right.className = "w-8/10 xl:w-4/6 flex flex-col min-h-0 bg-white/10 border border-white/15 rounded-xl mx-auto xl:mx-0";

    // /* Filtres */
    // const filters = document.createElement("div");
    // filters.className = "flex flex-col md:flex-row gap-3 md:items-center px-4 pt-4";

    // const select = document.createElement("select");
    // select.className = "px-3 py-2 rounded-md bg-green-600 border rounded-lg border-white/20 text-sm text-white focus:outline-none";
    // [
    //     {v:"all", l:t("all","All")},
    //     {v:"avatar", l:t("Avatar","Avatar")},
    //     {v:"background", l:t("Background","Background")},
    //     {v:"bar", l:t("Bar","Bar")},
    //     {v:"ball", l:t("Ball","Ball")},
    // ].forEach(o=>{
    //     const opt = document.createElement("option");
    //     opt.value=o.v; opt.textContent=o.l; select.appendChild(opt);
    // });

    // const search = document.createElement("input");
    // search.type="text";
    // search.placeholder = t("search","Search")+"...";
    // search.className = "flex-1 px-3 py-2 rounded-md bg-black/40 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none";
    // filters.appendChild(select);
    // filters.appendChild(search);
    // right.appendChild(filters);

    // /* Grille */
    // const listWrap = document.createElement("div");
    // listWrap.className = "mt-4 p-4 pt-2 flex-1 overflow-y-auto inventory-scroll min-h-0";

    // const grid = document.createElement("div");
    // grid.className = "grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
    // listWrap.appendChild(grid);
    // right.appendChild(listWrap);
    // layout.appendChild(right);

    // /* État filtre */
    // let currentType: 'all'|CosmeticType = 'all';
    // let query = "";

    // select.addEventListener("change", ()=>{
    //     currentType = select.value as any;
    //     renderGrid();
    // });
    // search.addEventListener("input", ()=>{
    //     query = search.value.toLowerCase();
    //     renderGrid();
    // });

    // /* Swap d’un item vers index 0 */
    // async function equipItem(type: CosmeticType, idx: number) {
    //     if (idx <= 0) return;
    //     const inventory = await getInventory();
    //     const arr = inventory[type + "_use"];
    //     if (!arr || idx >= arr.length) return;
    //     arr[0] = arr[idx];
    //     // updateLeft();
    //     emitProfileUpdate();
    //     renderGrid(); // rafraîchir highlight
    // }

    // /* Rendu liste */
    // async function renderGrid() {
    //     grid.innerHTML = "";
    //     const types: CosmeticType[] = ["avatar","background","bar","ball"];

    //     const inventory = await getInventory();

    //     const img1 = document.createElement("img");
    //     img1.className = "w-20 border-1 border-black" 
    //     img1.src = inventory[`${types}_use`][1].id;
    //     main.appendChild(img1);

    //     // types.forEach(type=>{
    //     //     if (currentType !== "all" && currentType !== type) return;
    //     //     const items = inventory[type];
    //     //     items.forEach((item, i)=>{
    //     //         if (i === 0) return;
    //     //         if (query && !item.name.toLowerCase().includes(query)) return;
    //     //         const cell = document.createElement("button");
    //     //         cell.type="button";
    //     //         cell.className = "relative group rounded-lg border border-white/15 bg-black/40 hover:bg-black/60 transition p-1 flex flex-col items-center";
    //     //         const img = document.createElement("img");
    //     //         img.src = item.id;
    //     //         img.alt = item.name;
    //     //         img.className = "w-full aspect-square object-cover rounded-md";
    //     //         const cap = document.createElement("span");
    //     //         cap.textContent = item.name;
    //     //         cap.className = "w-full mt-1 text-[10px] leading-tight text-white/80 text-center truncate";
    //     //         cell.appendChild(img);
    //     //         cell.appendChild(cap);
    //     //         cell.addEventListener("click", ()=> equipItem(type, i));
    //     //         grid.appendChild(cell);
    //     //     });
    //     // });
    // }
    // renderGrid();

    // function adjustHeights() {
    //     const layoutTop = layout.getBoundingClientRect().top;
    //     const marginBottom = 20;
    //     const H = Math.max(300, window.innerHeight - layoutTop - marginBottom);

    //     if (window.innerWidth >= 1024) {
    //         layout.style.height = H + "px";
    //     } else {
    //         layout.style.height = "auto";
    //     }

    //     left.style.height  = (window.innerWidth >= 1024) ? "100%" : "auto";
    //     right.style.height = (window.innerWidth >= 1024) ? "100%" : "auto";

    //     const listTop = listWrap.getBoundingClientRect().top;
    //     const available = window.innerHeight - listTop - marginBottom;
    //     listWrap.style.maxHeight = (available > 160 ? available : 160) + "px";
    // }
    // requestAnimationFrame(adjustHeights);
    // window.addEventListener("resize", adjustHeights);
    // window.addEventListener("orientationchange", adjustHeights);

    // (window as any).refreshInventoryGrid = renderGrid;

    return main;
}
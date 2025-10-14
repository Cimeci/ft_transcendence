import { t } from "./settings";
import { emitProfileUpdate } from './settings';

export type CosmeticType = 'avatar' | 'background' | 'paddle' | 'ball';

export const userInventory = {}

export interface CosmeticItem {
    src?: string;
    id: string;
    name: string;
    type?: string;
    price: number;
    usable?: boolean;
};

// Shape returned by GET /user/inventory
interface InventoryResponse {
    ball: CosmeticItem[];
    background: CosmeticItem[];
    paddle: CosmeticItem[];
    avatar: CosmeticItem[];
    ball_use: { id: string; name: string }[];
    background_use: { id: string; name: string }[];
    paddle_use: { id: string; name: string }[];
    avatar_use: { id: string; name: string }[];
}

/* Data access */
let cachedInventory: InventoryResponse | null = null;

async function fetchUserInventory(): Promise<InventoryResponse | null> {
    const token = localStorage.getItem("jwt") || "";
    if (!token) return null;

    const res = await fetch("/user/inventory", {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.filteredInventory as InventoryResponse;
}

async function getUserInventory(): Promise<InventoryResponse | null> {
    if (!cachedInventory) cachedInventory = await fetchUserInventory();
    return cachedInventory;
}

async function refreshInventory(): Promise<InventoryResponse | null> {
    cachedInventory = await fetchUserInventory();
    return cachedInventory;
}

/* ---- Page ---- */
export function InventoryPage(): HTMLElement {
    const main = document.createElement("div");
    main.className =
        "w-full min-h-screen bg-linear-to-t from-green-500 via-black to-green-800 pt-30 flex flex-col items-center";

    const title = document.createElement("h2");
    title.textContent = t.inventory;
    title.className = "tracking-widest fixed top-0 p-6 z-1000";
    main.appendChild(title);

    /* Layout principal: gauche (visuel) / droite (liste) */
    const layout = document.createElement("div");
    layout.className = "w-19/20 lg:w-9/10 xl:w-8/10 flex flex-col xl:flex-row gap-5 items-center xl:items-stretch min-h-0 justify-center";
    main.appendChild(layout);

    const left = document.createElement("div");
    left.className = "items-center w-8/10 xl:w-2/6 min-h-0 h-full flex flex-col overflow-hidden mx-auto xl:mx-0";
    layout.appendChild(left);

    /* Equipped preview */
    const previewsWrap = document.createElement("div");
    previewsWrap.className = "grid grid-cols-4 xl:grid-cols-2 grid-rows-1 xl:grid-rows-2 gap-4 h-full w-full";
    left.appendChild(previewsWrap);

    function imgPath(p: string | undefined): string {
        if (!p) return '';
        return '/' + p.replace(/^\/+/, '');
    }

    function makePreviewBox(label: string, type: CosmeticType, inventory: InventoryResponse): HTMLElement {
        const box = document.createElement("div");
        box.className = "h-full w-full bg-white/10 border border-white/15 rounded-xl p-2 flex flex-col items-center gap-3";

        const header = document.createElement("div");
        header.textContent = label;
        header.className = "w-full max-w-full text-xs sm:text-sm tracking-wide font-semibold text-white text-center bg-white/10 rounded px-2 py-1 truncate";
        header.title = label;

        const img = document.createElement("img");
        const key = `${type}_use` as keyof InventoryResponse;
        const equipped = (inventory[key] as any)?.[0];
        img.src = imgPath(equipped?.id || inventory[type]?.[0]?.id);
        img.alt = type;
        img.className = "w-full aspect-square object-cover rounded-lg bg-black/40 mt-2 sm:mt-5 xl:mt-10";

        const cap = document.createElement("div");
        cap.className = "text-white/80 text-xs truncate w-full text-center";
        cap.textContent = equipped?.name || inventory[type]?.[0]?.name || '';

        box.appendChild(header);
        box.appendChild(img);
        box.appendChild(cap);
        return box;
    }

    async function displayInventoryPreview() {
        const inventory = await getUserInventory();
        if (!inventory) return;
        previewsWrap.innerHTML = "";
        previewsWrap.appendChild(makePreviewBox("Avatar", "avatar", inventory));
        previewsWrap.appendChild(makePreviewBox("Background", "background", inventory));
        previewsWrap.appendChild(makePreviewBox("Paddle", "paddle", inventory));
        previewsWrap.appendChild(makePreviewBox("Ball", "ball", inventory));
    }

    // Initial preview load
    displayInventoryPreview();

    /* ---- Colonne droite: filtres + liste ---- */
    const right = document.createElement("div");
    right.className = "w-8/10 xl:w-4/6 flex flex-col min-h-0 bg-white/10 border border-white/15 rounded-xl mx-auto xl:mx-0";
    layout.appendChild(right);

    // Filtres
    const filters = document.createElement("div");
    filters.className = "flex flex-col md:flex-row gap-3 md:items-center px-4 pt-4";

    const select = document.createElement("select");
    select.className = "px-3 py-2 rounded-md bg-green-600 border rounded-lg border-white/20 text-sm text-white focus:outline-none";
    [
        {v:"all", l:t.all},
        {v:"avatar", l:t.avatar},
        {v:"background", l:t.gamebackground},
        // value must be 'paddle' (backend field), label can remain the translated 'bar'
        {v:"paddle", l:t.bar},
        {v:"ball", l:t.ball},
    ].forEach(o=>{
        const opt = document.createElement("option");
        opt.value=o.v; opt.textContent=o.l; select.appendChild(opt);
    });

    const search = document.createElement("input");
    search.type="text";
    search.placeholder = t.search + "...";
    search.className = "flex-1 px-3 py-2 rounded-md bg-black/40 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none";
    filters.appendChild(select);
    filters.appendChild(search);
    right.appendChild(filters);

    // Grille
    const listWrap = document.createElement("div");
    listWrap.className = "mt-4 p-4 pt-2 flex-1 overflow-y-auto inventory-scroll min-h-0";

    const grid = document.createElement("div");
    grid.className = "grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
    listWrap.appendChild(grid);
    right.appendChild(listWrap);
    layout.appendChild(right);

    // État filtre
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

    async function equipItem(type: CosmeticType, itemName: string) {
        const token = localStorage.getItem('jwt') || '';
        if (!token) return;
        const payloadKey = `${type}_use`;
        const res = await fetch('/user/inventory-use', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ [payloadKey]: itemName }),
        });
        if (!res.ok) {
            // Optionally show an error toast
            console.warn('Equip failed', await res.text());
            return;
        }
        await refreshInventory();
        await displayInventoryPreview();
        emitProfileUpdate();
        renderGrid();
    }

    function badge(text: string): HTMLElement {
        const b = document.createElement('span');
        b.textContent = text;
        b.className = 'absolute top-1 left-1 z-10 text-[10px] px-1.5 py-0.5 rounded bg-green-600/90 text-white';
        return b;
    }

    // Rendu liste
    async function renderGrid() {
        grid.innerHTML = "";
        const inventory = await getUserInventory();
        if (!inventory) return;
        const types: CosmeticType[] = ["avatar", "background", "paddle", "ball"];

        types.forEach(type=>{
            if (currentType !== "all" && currentType !== type) return;
            const items = inventory[type] || [];
            const equippedName = (inventory as any)[`${type}_use`]?.[0]?.name;

            items.forEach((item)=>{
                if (query && !item.name.toLowerCase().includes(query)) return;
                const isEquipped = item.name === equippedName;
                const isUsable = item.usable !== false; // default true if undefined

                if  (isUsable)
                {
                    const cell = document.createElement("button");
                    cell.type="button";
                    cell.disabled = isEquipped || !isUsable;
                    cell.className = [
                        "relative group rounded-lg border border-white/15 transition p-1 flex flex-col items-center",
                        isEquipped ? "bg-green-900/40" : "bg-black/40 hover:bg-black/60",
                        // !isUsable && !isEquipped ? "opacity-50 cursor-not-allowed" : ""
                    ].join(" ");
                
                    const img = document.createElement("img");
                    img.src = imgPath(item.id);
                    img.alt = item.name;
                    img.className = "w-full aspect-square object-cover rounded-md";
                    const cap = document.createElement("span");
                    cap.textContent = item.name;
                    cap.className = "w-full mt-1 text-[10px] leading-tight text-white/80 text-center truncate";
                
                    if (isEquipped) cell.appendChild(badge('Equipped'));
                    // if (!isUsable && !isEquipped) {
                    //     const lock = document.createElement('span');
                    //     lock.textContent = 'Locked';
                    //     lock.className = 'absolute top-1 right-1 z-10 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white';
                    //     cell.appendChild(lock);
                    // }
                
                    cell.appendChild(img);
                    cell.appendChild(cap);
                    if (!isEquipped && isUsable) {
                        cell.addEventListener("click", ()=> equipItem(type, item.name));
                    }
                    grid.appendChild(cell);
                }
            });
        });
    }

    renderGrid();

    function adjustHeights() {
        const layoutTop = layout.getBoundingClientRect().top;
        const marginBottom = 20;
        const H = Math.max(300, window.innerHeight - layoutTop - marginBottom);

        if (window.innerWidth >= 1024) {
            layout.style.height = H + "px";
        } else {
            layout.style.height = "auto";
        }

        left.style.height  = (window.innerWidth >= 1024) ? "100%" : "auto";
        right.style.height = (window.innerWidth >= 1024) ? "100%" : "auto";

        const listTop = listWrap.getBoundingClientRect().top;
        const available = window.innerHeight - listTop - marginBottom;
        listWrap.style.maxHeight = (available > 160 ? available : 160) + "px";
    }
    requestAnimationFrame(adjustHeights);
    window.addEventListener("resize", adjustHeights);
    window.addEventListener("orientationchange", adjustHeights);

    (window as any).refreshInventoryGrid = async () => { await refreshInventory(); await displayInventoryPreview(); renderGrid(); };

    return main;
}
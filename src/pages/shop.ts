import { getCurrentLang } from "../pages/settings";
import { translations } from '../i18n';
import { userInventory } from "./inventory";

type ShopType = 'avatar' | 'background' | 'bar' | 'ball';
interface ShopItem { id: string; name: string; type: ShopType; price: number; }

export function ShopPage(): HTMLElement {
    // Helper i18n
    const lang = getCurrentLang();
    // @ts-ignore
    const t = (k: string, fallback?: string) => (translations[lang] && translations[lang][k]) || fallback || k;

    const mainContainer = document.createElement("div");
    mainContainer.className = "w-full min-h-screen bg-linear-to-t from-green-500 via-black to-green-800 pt-30 flex flex-col items-center";

    const title = document.createElement("h2");
    title.textContent = t("shop", "Shop");
    title.className = "tracking-widest fixed top-0 p-6 z-1000";
    mainContainer.appendChild(title);

    // Barre outils (select + search + wallet)
    const wrapper = document.createElement("div");
    wrapper.className = "w-19/20 lg:w-9/10 xl:w-8/10 flex flex-col gap-4";
    mainContainer.appendChild(wrapper);

    const toolbar = document.createElement("div");
    toolbar.className = "w-full flex items-center gap-3";
    wrapper.appendChild(toolbar);

    const select = document.createElement("select");
    select.className = "matrix-select px-4 py-2 rounded-lg border border-green-500/40 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500";
    [
        { v: "all", l: t("all", "All") },
        { v: "avatar", l: t("Avatar", "Avatar") },
        { v: "background", l: t("Background", "Background") },
        { v: "bar", l: t("Bar", "Bar") },
        { v: "ball", l: t("Ball", "Ball") },
    ].forEach(o => {
        const opt = document.createElement("option");
        opt.value = o.v; opt.textContent = o.l; select.appendChild(opt);
    });
    toolbar.appendChild(select);

    const search = document.createElement("input");
    search.type = "text";
    search.placeholder = t("search", "Search") + "...";
    search.className = "flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500";
    toolbar.appendChild(search);

    const wallet = document.createElement("div");
    wallet.className = "ml-auto px-4 py-2 rounded-lg border border-white/40 text-white/90";
    wallet.textContent = "600 $";
    toolbar.appendChild(wallet);

    // Panneau scrollable + grille
    const panel = document.createElement("div");
    panel.className = "rounded-2xl bg-white/15 border border-white/20 p-4 pt-3 max-h-[calc(100vh-210px)] overflow-y-auto inventory-scroll";
    wrapper.appendChild(panel);

    const grid = document.createElement("div");
    grid.className = "grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5";
    panel.appendChild(grid);

    // État filtres
    let currentType: "all" | ShopType = "all";
    let query = "";

    // Aplatit userInventory -> ShopItem[]
    function allInventoryItems(): ShopItem[] {
        const types: ShopType[] = ["avatar","background","bar","ball"];
        return types.flatMap(type =>
            (userInventory as any)[type]?.map((i: any) => ({
                id: i.id ?? i.src ?? "",
                name: i.name,
                type,
                price: i.price ?? 0,
            })) ?? []
        ) as ShopItem[];
    }

    select.addEventListener("change", () => { currentType = select.value as any; render(); });
    search.addEventListener("input", () => { query = search.value.toLowerCase(); render(); });

    function makeCard(it: ShopItem): HTMLElement {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "rounded-xl bg-white/40 hover:bg-white/50 transition p-3 flex flex-col gap-0.1 items-center";

		const name = document.createElement("div");
		name.className = "truncate w-full text-center px-2 py-1.5 rounded bg-white/60 text-gray-800 text-sm tracking-[0.1em] font-semibold";
		name.textContent = `${it.name}`;
		card.appendChild(name);
		
        // Cadre + image
        const frame = document.createElement("div");
        frame.className = "w-full rounded-lg p-4";
        const img = document.createElement("img");
        img.src = it.id;
        img.alt = it.name;
        img.className = "w-full aspect-square object-contain rounded-md";
        frame.appendChild(img);
        card.appendChild(frame);

        // Prix (style espacé)
        const price = document.createElement("div");
        price.className = "truncate w-9/10 text-center px-2 py-1.5 rounded-lg bg-white/60 text-gray-800 text-xs tracking-[0.2em] font-semibold hover:scale-110 transition-all duration-300";
        price.textContent = `${it.price} $`;
        card.appendChild(price);

        // Interaction "Buy" maquette
        price.addEventListener("click", () => {
            const old = price.textContent || "";
            price.textContent = "B U Y";
            price.classList.add("text-white");
            setTimeout(() => {
                price.textContent = old;
                price.classList.remove("text-white");
            }, 800);
        });

        return card;
    }

    function render() {
        grid.innerHTML = "";
        // Filtre: ne pas afficher les items contenant "default"
        const items = allInventoryItems().filter(it =>
            !/default/i.test(it.name) && !/default/i.test(it.id)
        );
        items.forEach(it => {
            if (currentType !== "all" && it.type !== currentType) return;
            if (query && !it.name.toLowerCase().includes(query)) return;
            grid.appendChild(makeCard(it));
        });
    }
    render();

    return mainContainer;
}
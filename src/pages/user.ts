import { getCurrentLang } from "./settings";
import { translations } from "../i18n";
import { userInventory, userName } from "./inventory";

export function UserPage(): HTMLElement {
    const main = document.createElement("div");
    main.className = "min-h-screen w-full flex items-start justify-center bg-linear-to-l from-black via-green-900 to-black pt-22 pb-8";

    const wrap = document.createElement("div");
    wrap.className = "w-full max-w-6xl";
    main.appendChild(wrap);

    const banner = document.createElement("div");
    banner.className = "relative h-48 sm:h-56 rounded-3xl overflow-hidden shadow-lg";
	
    const bg = document.createElement("img");
    bg.src = userInventory.background?.[0]?.id || "/bg/default_bg.png";
    bg.alt = "";
    bg.className = "absolute inset-0 w-full h-full object-cover";

    banner.appendChild(bg);

    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent";

    banner.appendChild(overlay);
    wrap.appendChild(banner);

    const card = document.createElement("div");
    card.className = "-mt-16 sm:-mt-20 mx-3 sm:mx-6 bg-white/10 backdrop-blur border border-white/10 rounded-2xl shadow-xl px-6 sm:px-8 py-5";
    wrap.appendChild(card);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 sm:grid-cols-[1.2fr_auto_1.2fr] items-center gap-6 sm:gap-8";
    card.appendChild(grid);

    const stats = document.createElement("div");
    stats.className = "flex items-center justify-between sm:justify-start gap-6 text-white/90";

    const s1 = document.createElement("div");

    const s1a = document.createElement("p");
	s1a.className = "text-xs uppercase text-white/60";
	s1a.textContent = "Total Game";

    const s1b = document.createElement("p");
	s1b.className = "text-lg font-semibold";
	s1b.textContent = "1956";

    s1.appendChild(s1a); s1.appendChild(s1b);

    const s2 = document.createElement("div");

    const s2a = document.createElement("p");
	s2a.className = "text-xs uppercase text-white/60";
	s2a.textContent = "Win";

    const s2b = document.createElement("p");
	s2b.className = "text-lg font-semibold";
	s2b.textContent = "85%";

    s2.appendChild(s2a); s2.appendChild(s2b);

    const s3 = document.createElement("div");
    const s3a = document.createElement("p");
	s3a.className = "text-xs uppercase text-white/60";
	s3a.textContent = "Loss";

    const s3b = document.createElement("p");
	s3b.className = "text-lg font-semibold";
	s3b.textContent = "25%";

    s3.appendChild(s3a); s3.appendChild(s3b);

    stats.appendChild(s1); stats.appendChild(s2); stats.appendChild(s3);
    grid.appendChild(stats);

    const center = document.createElement("div");
    center.className = "flex flex-col items-center gap-2";

    const avatar = document.createElement("img");
    avatar.src = userInventory.avatar?.[0]?.id || "/avatar/default_avatar.png";
    avatar.alt = "avatar";
    avatar.className = "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-green-500/50";

    const name = document.createElement("h2");
    name.textContent = userName;
    name.className = "text-white font-semibold text-lg";

    center.appendChild(avatar);
    center.appendChild(name);
    grid.appendChild(center);

    const right = document.createElement("div");
    right.className = "w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 sm:gap-8 text-white/90";

    // Barre active
    const barWrap = document.createElement("div");
    barWrap.className = "flex items-center gap-2";
    const barLabel = document.createElement("span");
    barLabel.className = "text-xs uppercase text-white/60 hidden sm:block";
    barLabel.textContent = "Bar";
    const barImg = document.createElement("img");
    barImg.src = userInventory.bar?.[0]?.id || "/bar/default_bar.png";
    barImg.alt = "bar";
    barImg.className = "h-6 sm:h-8 object-contain drop-shadow";
    barWrap.appendChild(barLabel); barWrap.appendChild(barImg);

    // Balle active
    const ballWrap = document.createElement("div");
    ballWrap.className = "flex items-center gap-2";
    const ballLabel = document.createElement("span");
    ballLabel.className = "text-xs uppercase text-white/60 hidden sm:block";
    ballLabel.textContent = "Ball";
    const ballImg = document.createElement("img");
    ballImg.src = userInventory.ball?.[0]?.id || "/ball/default_ball.png";
    ballImg.alt = "ball";
    ballImg.className = "w-6 h-6 sm:w-8 sm:h-8 object-contain drop-shadow";
    ballWrap.appendChild(ballLabel); ballWrap.appendChild(ballImg);

    right.appendChild(barWrap);
    right.appendChild(ballWrap);
    grid.appendChild(right);

    window.addEventListener("profile:update", (e: Event) => {
        const d = (e as CustomEvent).detail || {};
        if (typeof d.userName === "string") name.textContent = d.userName;
        if (typeof d.avatar === "string") avatar.src = d.avatar;
        if (userInventory.background?.[0]?.id) bg.src = userInventory.background[0].id;
        if (userInventory.bar?.[0]?.id) (document.querySelector('img[alt="bar"]') as HTMLImageElement).src = userInventory.bar[0].id;
        if (userInventory.ball?.[0]?.id) (document.querySelector('img[alt="ball"]') as HTMLImageElement).src = userInventory.ball[0].id;
    });

    return main;
}
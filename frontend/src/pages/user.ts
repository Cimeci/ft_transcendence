import { getCurrentLang } from "./settings";
import { translations } from "../i18n";
import { userInventory } from "./inventory";
import { navigateTo } from "../routes";
import { getUser } from "../linkUser";

export function UserPage(): HTMLElement {
    const main = document.createElement("div");
    main.className = "min-h-screen w-full flex items-center justify-center bg-linear-to-l from-black via-green-900 to-black py-10";
    
    const profileContainer = document.createElement("div");
    profileContainer.className = "w-full mt-10 max-w-6xl mx-auto px-3 sm:px-6 flex flex-col items-stretch";

    { // top Wrap profile
        const wrap = document.createElement("div");
        wrap.className = "w-full";
        profileContainer.appendChild(wrap);

        const banner = document.createElement("div");
        banner.className = "relative h-48 sm:h-56 rounded-3xl overflow-hidden shadow-lg";
        
        const bg = document.createElement("img");
        bg.src = userInventory.background?.[0]?.id || "/bg/default_bg.png";
        // bg.src = "/bg/matrix_bg.gif";
        bg.alt = "";
        bg.className = "absolute inset-0 w-full h-full object-cover";

        banner.appendChild(bg);

        const overlay = document.createElement("div");
        overlay.className = "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent";

        banner.appendChild(overlay);
        wrap.appendChild(banner);

        // card sous le banner
        const card = document.createElement("div");
        card.className = "-mt-16 sm:-mt-20 bg-white/10 backdrop-blur border border-white/10 rounded-2xl shadow-xl px-6 sm:px-8 py-5";
        wrap.appendChild(card);

        const grid = document.createElement("div");
        grid.className = "grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-6 sm:gap-8";
        card.appendChild(grid);

        const stats = document.createElement("div");
        stats.className = "grid grid-cols-3 w-full text-white/90";

        const s1 = document.createElement("div");
        s1.className = "flex flex-col items-left sm:items-center justify-center text-left sm:text-center  gap-1";

        const s1a = document.createElement("p");
	    s1a.className = "text-xs uppercase text-white/60";
	    s1a.textContent = translations[getCurrentLang()].Total_game;

        const s1b = document.createElement("p");
	    s1b.className = "text-lg font-semibold";
	    s1b.textContent = "1956";

        s1.appendChild(s1a); s1.appendChild(s1b);

        const s2 = document.createElement("div");
        s2.className = "flex flex-col items-center justify-center text-center gap-1";

        const s2a = document.createElement("p");
	    s2a.className = "text-xs uppercase text-white/60";
	    s2a.textContent = translations[getCurrentLang()].Win;

        const s2b = document.createElement("p");
	    s2b.className = "text-lg font-semibold";
	    s2b.textContent = "85%";

        s2.appendChild(s2a); s2.appendChild(s2b);

        const s3 = document.createElement("div");
        s3.className = "flex flex-col items-right sm:items-center justify-center text-right sm:text-center gap-1";

        const s3a = document.createElement("p");
	    s3a.className = "text-xs uppercase text-white/60";
	    s3a.textContent = translations[getCurrentLang()].Lose;

        const s3b = document.createElement("p");
	    s3b.className = "text-lg font-semibold";
	    s3b.textContent = "25%";

        s3.appendChild(s3a); s3.appendChild(s3b);

        stats.appendChild(s1); stats.appendChild(s2); stats.appendChild(s3);
        grid.appendChild(stats);

        const center = document.createElement("div");
        center.className = "flex flex-col items-center gap-2 justify-self-center";

        const avatarWrap = document.createElement("div");
        avatarWrap.className = "relative"
        
        const avatar = document.createElement("img");
        avatar.src = userInventory.avatar?.[0]?.id || "/avatar/default_avatar.png";
        avatar.alt = "avatar";
        avatar.className = "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-green-500/50";
        avatarWrap.appendChild(avatar)

        const status = document.createElement("span");
        status.className = "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-black/60";
        avatarWrap.appendChild(status);

        Number(localStorage.getItem("is_online")) == 1 ? status.classList.add("bg-green-600"): status.classList.add("bg-gray-600")


        const name = document.createElement("h2");
        name.textContent = getUser()?.username || "default";
        name.className = "text-white font-semibold text-lg";

        center.appendChild(avatarWrap);
        center.appendChild(name);
        grid.appendChild(center);

        const right = document.createElement("div");
        right.className = "w-full sm:w-auto flex flex-col items-end justify-center gap-3 sm:gap-4 text-white/90";

        // Ligne Bar + Ball
        const itemsRow = document.createElement("div");
        itemsRow.className = "flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full";

        // Barre active
        const barWrap = document.createElement("div");
        barWrap.className = "flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-2";
        const barLabel = document.createElement("span");
        barLabel.className = "text-xs uppercase text-white/60";
        barLabel.textContent = "Bar";
        const barImg = document.createElement("img");
        barImg.src = userInventory.bar?.[0]?.id || "/bar/default_bar.png";
        barImg.alt = "bar";
        barImg.className = "h-6 sm:h-8 object-contain drop-shadow";

        barWrap.appendChild(barLabel); barWrap.appendChild(barImg);
 
        // Balle active
        const ballWrap = document.createElement("div");
        ballWrap.className = "flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-2";
        const ballLabel = document.createElement("span");
        ballLabel.className = "text-xs uppercase text-white/60";
        ballLabel.textContent = "Ball";
        const ballImg = document.createElement("img");
        ballImg.src = userInventory.ball?.[0]?.id || "/ball/default_ball.png";
        ballImg.alt = "ball";
        ballImg.className = "w-6 h-6 sm:w-8 sm:h-8 object-contain drop-shadow";

        ballWrap.appendChild(ballLabel); ballWrap.appendChild(ballImg);
 
        itemsRow.appendChild(barWrap);
        itemsRow.appendChild(ballWrap);
        right.appendChild(itemsRow);

        { // CHANGE BTN //! change it by the relation between user and user look
            const addBtn = document.createElement("button");
            addBtn.type = "button";
            addBtn.className = "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 duration-300 transition-all hover:scale-105 text-white text-sm shadow";
            addBtn.textContent = (translations[getCurrentLang()].add);
            addBtn.addEventListener("click", () => navigateTo("/friends"));//! add user + notif

            const addIcon = document.createElement("img");
            addIcon.src = "/icons/plus.svg";
            addBtn.prepend(addIcon);
            // right.appendChild(addBtn);

            const friendDiv = document.createElement("div");
            friendDiv.className = "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 duration-300 transition-all hover:scale-105 text-white text-sm shadow";
            friendDiv.textContent = (translations[getCurrentLang()].friends);
            // right.appendChild(friendDiv);

            const friendIcon = document.createElement("img");
            friendIcon.src = "/icons/contact.svg";
            friendDiv.prepend(friendIcon);

            const blockDiv = document.createElement("div");
            blockDiv.className = "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 duration-300 transition-all hover:scale-105 text-white text-sm shadow";
            blockDiv.textContent = (translations[getCurrentLang()].block);
            // right.appendChild(blockDiv);

            const blockIcon = document.createElement("img");
            blockIcon.src = "/icons/user-lock.svg";
            blockDiv.prepend(blockIcon);

            const nb = Math.floor(Math.random() * 4);
            if (nb == 0){}
            else if (nb == 1){ right.appendChild(addBtn); }
            else if (nb == 2){ right.appendChild(friendDiv); }
            else if (nb == 3){ right.appendChild(blockDiv); }
        }

        grid.appendChild(right);
    }
    
    { // bottom layout: Inventory (left) + History (right)
        const bottom = document.createElement("div");
        bottom.className = "w-full mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6";
        profileContainer.appendChild(bottom);

        // Inventory card (left)
        const invCard = document.createElement("section");
        invCard.className = "flex flex-col bg-white/10 backdrop-blur border border-white/10 rounded-2xl shadow-xl min-h-[45vh] max-h-[60vh]";
        
        const invHeader = document.createElement("div");
        invHeader.className = "px-4 sm:px-6 py-3 border-b border-white/10";
        
        const invTitle = document.createElement("h2");
        invTitle.className = "text-center text-white font-semibold";
        invTitle.textContent = translations[getCurrentLang()].inventory;
        invHeader.appendChild(invTitle);
        
        const invBody = document.createElement("div");
        invBody.className = "flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden scroll_bar";

        // Barres (grille jusqu’à 5 par ligne)
        const barsGrid = document.createElement("div");
        barsGrid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6";
        (Array.isArray(userInventory.bar) ? userInventory.bar.slice(1) : []).forEach((it) => {
            const tile = document.createElement("div");
            tile.className = "rounded-xl bg-white/5 border border-white/10 flex items-center justify-center h-24";
            const img = document.createElement("img");
            img.src = it.id;
            img.alt = it.name;
            img.className = "max-w-full h-16 sm:h-20 object-contain drop-shadow";
            tile.appendChild(img);
            barsGrid.appendChild(tile);
        });
        invBody.appendChild(barsGrid);

         // Balles (grille)
        const ballsGrid = document.createElement("div");
        ballsGrid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4";
        (Array.isArray(userInventory.ball) ? userInventory.ball.slice(1) : []).forEach((it) => {
           const tile = document.createElement("div");
           tile.className = "rounded-xl bg-white/5 border border-white/10 flex items-center justify-center h-24";
           const img = document.createElement("img");
           img.src = it.id;
           img.alt = it.name;
           img.className = "w-10 h-10 sm:w-12 sm:h-12 object-contain max-w-full drop-shadow";
           tile.appendChild(img);
           ballsGrid.appendChild(tile);
        });
        invBody.appendChild(ballsGrid);
        invCard.appendChild(invHeader);
        invCard.appendChild(invBody);
        bottom.appendChild(invCard);

        // History card (right)
        const histCard = document.createElement("section");
        histCard.className = "flex flex-col bg-white/10 backdrop-blur border border-white/10 rounded-2xl shadow-xl min-h-[45vh] max-h-[60vh]";
        
        const histHeader = document.createElement("div");
        histHeader.className = "px-4 sm:px-6 py-3 border-b border-white/10";
        
        const histTitle = document.createElement("h2");
        histTitle.className = "text-center text-white font-semibold";
        histTitle.textContent = translations[getCurrentLang()].history;
        histHeader.appendChild(histTitle);
        
        const histBody = document.createElement("div");
        histBody.className = "flex-1 p-4 sm:p-6 min-h-0";

        // Données démo – remplace par tes données (DB)
        type TournamentRow = { name: string; place: string };
        type ClassicRow = { opponent: string; score: string };
        const tournaments: TournamentRow[] = [
            { name: "ilan tournament", place: "first" },
            { name: "test tournament", place: "third" },
            { name: "test tournament", place: "5" },
            { name: "amaury tournament", place: "10" },
            { name: "hello tournament", place: "15" },
            { name: "asdf", place: "5" },
            { name: "hi", place: "7" },
            { name: "test tournament", place: "8" },
            { name: "test tournament", place: "12" },
            { name: "test tournament", place: "second" },
            { name: "test tournament", place: "second" },
            { name: "test tournament", place: "second" },

        ];
        const classics: ClassicRow[] = [
            { opponent: "amaury", score: "4 - 5" },
            { opponent: "amaury", score: "1 - 5" },
            { opponent: "amaury", score: "5 - 3" },
            { opponent: "amaury", score: "3 - 5" },
            { opponent: "amaury", score: "4 - 5" },
            { opponent: "amaury", score: "2 - 5" },
            { opponent: "amaury", score: "4 - 3" },
            { opponent: "amaury", score: "5 - 2" },
            { opponent: "amaury", score: "5 - 3" },
            { opponent: "amaury", score: "5 - 1" },
            { opponent: "amaury", score: "5 - 1" },
            { opponent: "amaury", score: "5 - 1" },
            { opponent: "amaury", score: "5 - 1" },

        ];

        // Colonnes: Tournoi | Classique
        const cols = document.createElement("div");
        cols.className = "grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0";

        // Colonne Tournoi
        const tournCol = document.createElement("div");
        tournCol.className = "flex flex-col h-full min-h-0";

        const tournHead = document.createElement("div");
        tournHead.className = "px-2 pb-2 mb-3 border-b border-white/10";

        const tournTitle = document.createElement("h3");
        tournTitle.className = "text-center text-white font-semibold";
        tournTitle.textContent = translations[getCurrentLang()].tournament;
        tournHead.appendChild(tournTitle);

        const tournList = document.createElement("ul");
        tournList.className = "flex-1 divide-y divide-white/10 overflow-y-auto overflow-x-hidden min-h-0 pr-1 scroll_bar";
        tournaments.forEach((row) => {
            const li = document.createElement("li");
            li.className = "grid grid-cols-[1fr_auto] gap-4 items-center py-2 px-2 text-white/90";
            const name = document.createElement("span");
            name.className = "truncate min-w-0";
            name.textContent = row.name;
            const place = document.createElement("span");
            place.className = "text-right text-white/70";
            place.textContent = row.place;
            li.appendChild(name);
            li.appendChild(place);
            tournList.appendChild(li);
        });
        tournCol.appendChild(tournHead);
        tournCol.appendChild(tournList);

        // Colonne Classique
        const classCol = document.createElement("div");
        classCol.className = "flex flex-col h-full min-h-0";
        const classHead = document.createElement("div");
        classHead.className = "px-2 pb-2 mb-3 border-b border-white/10";
        const classTitle = document.createElement("h3");
        classTitle.className = "text-center text-white font-semibold";
        classTitle.textContent = translations[getCurrentLang()].classic;
        classHead.appendChild(classTitle);
        const classList = document.createElement("ul");
        classList.className = "flex-1 divide-y divide-white/10 overflow-y-auto overflow-x-hidden min-h-0 pr-1 scroll_bar";
        classics.forEach((row) => {
            const li = document.createElement("li");
            li.className = "grid grid-cols-[1fr_auto] gap-4 items-center py-2 px-2 text-white/90";
            const vs = document.createElement("span");
            vs.className = "truncate min-w-0";
            vs.textContent = `vs ${row.opponent}`;
            const score = document.createElement("span");
            score.className = "text-right text-white/70";
            score.textContent = row.score;
            li.appendChild(vs);
            li.appendChild(score);
            classList.appendChild(li);
        });
        classCol.appendChild(classHead);
        classCol.appendChild(classList);

        cols.appendChild(tournCol);
        cols.appendChild(classCol);
        histBody.appendChild(cols);

        histCard.appendChild(histHeader);
        histCard.appendChild(histBody);
        bottom.appendChild(histCard);
    }
 
     main.appendChild(profileContainer);
 
     return main;
}

async function GetData() {
    const url = new URL(window.location.href);
    const uuid = url.searchParams.get("id") || "";
    const token = localStorage.getItem("jwt")   
    try
    {
        const resp = await fetch(`user/${encodeURIComponent(uuid)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
            },
        });
        if (!resp.ok) {
          console.error(`Erreur serveur (${resp.status})`);
          return;
        }
        console.log("HERE!!!!!!!!!!!!!!!!!!!!!!", resp);
        const data = await resp.json();
        console.log("HERE!!!!!!!!!!!!!!!!!!!!!!", resp);
        return (data.user);
    } catch(e) {console.error(e)};
}

export function UserFriendsPage(): HTMLElement {
    const main = document.createElement("div");
    main.className = "min-h-screen w-full flex items-center justify-center bg-linear-to-l from-black via-green-900 to-black py-10";
    
    const profileContainer = document.createElement("div");
    profileContainer.className = "w-full mt-10 max-w-6xl mx-auto px-3 sm:px-6 flex flex-col items-stretch";


        const wrap = document.createElement("div");
        wrap.className = "w-full";
        profileContainer.appendChild(wrap);

        const banner = document.createElement("div");
        banner.className = "relative h-48 sm:h-56 rounded-3xl overflow-hidden shadow-lg";
        
        const bg = document.createElement("img");
        bg.src =  "/bg/default_bg.png";
        // bg.src = "/bg/matrix_bg.gif";
        bg.alt = "";
        bg.className = "absolute inset-0 w-full h-full object-cover";

        banner.appendChild(bg);

        const overlay = document.createElement("div");
        overlay.className = "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent";

        banner.appendChild(overlay);
        wrap.appendChild(banner);

        // card sous le banner
        const card = document.createElement("div");
        card.className = "-mt-16 sm:-mt-20 bg-white/10 backdrop-blur border border-white/10 rounded-2xl shadow-xl px-6 sm:px-8 py-5";
        wrap.appendChild(card);

        const grid = document.createElement("div");
        grid.className = "grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-6 sm:gap-8";
        card.appendChild(grid);

        const stats = document.createElement("div");
        stats.className = "grid grid-cols-3 w-full text-white/90";

        const s1 = document.createElement("div");
        s1.className = "flex flex-col items-left sm:items-center justify-center text-left sm:text-center  gap-1";

        const s1a = document.createElement("p");
	    s1a.className = "text-xs uppercase text-white/60";
	    s1a.textContent = translations[getCurrentLang()].Total_game;

        const s1b = document.createElement("p");
	    s1b.className = "text-lg font-semibold";
	    s1b.textContent = "1956";

        s1.appendChild(s1a); s1.appendChild(s1b);

        const s2 = document.createElement("div");
        s2.className = "flex flex-col items-center justify-center text-center gap-1";

        const s2a = document.createElement("p");
	    s2a.className = "text-xs uppercase text-white/60";
	    s2a.textContent = translations[getCurrentLang()].Win;

        const s2b = document.createElement("p");
	    s2b.className = "text-lg font-semibold";
	    s2b.textContent = "85%";

        s2.appendChild(s2a); s2.appendChild(s2b);

        const s3 = document.createElement("div");
        s3.className = "flex flex-col items-right sm:items-center justify-center text-right sm:text-center gap-1";

        const s3a = document.createElement("p");
	    s3a.className = "text-xs uppercase text-white/60";
	    s3a.textContent = translations[getCurrentLang()].Lose;

        const s3b = document.createElement("p");
	    s3b.className = "text-lg font-semibold";
	    s3b.textContent = "25%";

        s3.appendChild(s3a); s3.appendChild(s3b);

        stats.appendChild(s1); stats.appendChild(s2); stats.appendChild(s3);
        grid.appendChild(stats);

        const center = document.createElement("div");
        center.className = "flex flex-col items-center gap-2 justify-self-center";

        const avatarWrap = document.createElement("div");
        avatarWrap.className = "relative"
        
        const avatar = document.createElement("img");
        avatar.src = userInventory.avatar?.[0]?.id || "/avatar/default_avatar.png";
        avatar.alt = "avatar";
        avatar.className = "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-green-500/50";
        avatarWrap.appendChild(avatar)

        const status = document.createElement("span");
        status.className = "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-black/60";
        avatarWrap.appendChild(status);

        const name = document.createElement("h2");
        name.textContent = getUser()?.username || "default";
        name.className = "text-white font-semibold text-lg";

        center.appendChild(avatarWrap);
        center.appendChild(name);
        grid.appendChild(center);

        const right = document.createElement("div");
        right.className = "w-full sm:w-auto flex flex-col items-end justify-center gap-3 sm:gap-4 text-white/90";

        // Ligne Bar + Ball
        const itemsRow = document.createElement("div");
        itemsRow.className = "flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full";

        // Barre active
        const barWrap = document.createElement("div");
        barWrap.className = "flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-2";
        const barLabel = document.createElement("span");
        barLabel.className = "text-xs uppercase text-white/60";
        barLabel.textContent = "Bar";
        const barImg = document.createElement("img");
        barImg.src = userInventory.bar?.[0]?.id || "/bar/default_bar.png";
        barImg.alt = "bar";
        barImg.className = "h-6 sm:h-8 object-contain drop-shadow";

        barWrap.appendChild(barLabel); barWrap.appendChild(barImg);
 
        // Balle active
        const ballWrap = document.createElement("div");
        ballWrap.className = "flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-2";
        const ballLabel = document.createElement("span");
        ballLabel.className = "text-xs uppercase text-white/60";
        ballLabel.textContent = "Ball";
        const ballImg = document.createElement("img");
        ballImg.src = userInventory.ball?.[0]?.id || "/ball/default_ball.png";
        ballImg.alt = "ball";
        ballImg.className = "w-6 h-6 sm:w-8 sm:h-8 object-contain drop-shadow";

        ballWrap.appendChild(ballLabel); ballWrap.appendChild(ballImg);
 
        itemsRow.appendChild(barWrap);
        itemsRow.appendChild(ballWrap);
        right.appendChild(itemsRow);

        { // CHANGE BTN //! change it by the relation between user and user look
            const addBtn = document.createElement("button");
            addBtn.type = "button";
            addBtn.className = "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 duration-300 transition-all hover:scale-105 text-white text-sm shadow";
            addBtn.textContent = (translations[getCurrentLang()].add);
            addBtn.addEventListener("click", () => navigateTo("/friends"));//! add user + notif

            const addIcon = document.createElement("img");
            addIcon.src = "/icons/plus.svg";
            addBtn.prepend(addIcon);
            // right.appendChild(addBtn);

            const friendDiv = document.createElement("div");
            friendDiv.className = "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 duration-300 transition-all hover:scale-105 text-white text-sm shadow";
            friendDiv.textContent = (translations[getCurrentLang()].friends);
            // right.appendChild(friendDiv);

            const friendIcon = document.createElement("img");
            friendIcon.src = "/icons/contact.svg";
            friendDiv.prepend(friendIcon);

            const nb = Math.floor(Math.random() * 4);
            if (nb == 0){}
            else if (nb == 1){ right.appendChild(addBtn); }
            else if (nb == 2){ right.appendChild(friendDiv); }
        }

        grid.appendChild(right);
    
        const bottom = document.createElement("div");
        bottom.className = "w-full mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6";
        profileContainer.appendChild(bottom);

        // Inventory card (left)
        const invCard = document.createElement("section");
        invCard.className = "flex flex-col bg-white/10 backdrop-blur border border-white/10 rounded-2xl shadow-xl min-h-[45vh] max-h-[60vh]";
        
        const invHeader = document.createElement("div");
        invHeader.className = "px-4 sm:px-6 py-3 border-b border-white/10";
        
        const invTitle = document.createElement("h2");
        invTitle.className = "text-center text-white font-semibold";
        invTitle.textContent = translations[getCurrentLang()].inventory;
        invHeader.appendChild(invTitle);
        
        const invBody = document.createElement("div");
        invBody.className = "flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden scroll_bar";

        // Barres (grille jusqu’à 5 par ligne)
        const barsGrid = document.createElement("div");
        barsGrid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6";
        (Array.isArray(userInventory.bar) ? userInventory.bar.slice(1) : []).forEach((it) => {
            const tile = document.createElement("div");
            tile.className = "rounded-xl bg-white/5 border border-white/10 flex items-center justify-center h-24";
            const img = document.createElement("img");
            img.src = it.id;
            img.alt = it.name;
            img.className = "max-w-full h-16 sm:h-20 object-contain drop-shadow";
            tile.appendChild(img);
            barsGrid.appendChild(tile);
        });
        invBody.appendChild(barsGrid);

         // Balles (grille)
        const ballsGrid = document.createElement("div");
        ballsGrid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4";
        (Array.isArray(userInventory.ball) ? userInventory.ball.slice(1) : []).forEach((it) => {
           const tile = document.createElement("div");
           tile.className = "rounded-xl bg-white/5 border border-white/10 flex items-center justify-center h-24";
           const img = document.createElement("img");
           img.src = it.id;
           img.alt = it.name;
           img.className = "w-10 h-10 sm:w-12 sm:h-12 object-contain max-w-full drop-shadow";
           tile.appendChild(img);
           ballsGrid.appendChild(tile);
        });
        invBody.appendChild(ballsGrid);
        invCard.appendChild(invHeader);
        invCard.appendChild(invBody);
        bottom.appendChild(invCard);

        // History card (right)
        const histCard = document.createElement("section");
        histCard.className = "flex flex-col bg-white/10 backdrop-blur border border-white/10 rounded-2xl shadow-xl min-h-[45vh] max-h-[60vh]";
        
        const histHeader = document.createElement("div");
        histHeader.className = "px-4 sm:px-6 py-3 border-b border-white/10";
        
        const histTitle = document.createElement("h2");
        histTitle.className = "text-center text-white font-semibold";
        histTitle.textContent = translations[getCurrentLang()].history;
        histHeader.appendChild(histTitle);
        
        const histBody = document.createElement("div");
        histBody.className = "flex-1 p-4 sm:p-6 min-h-0";

        // Données démo – remplace par tes données (DB)
        type TournamentRow = { name: string; place: string };
        type ClassicRow = { opponent: string; score: string };
        const tournaments: TournamentRow[] = [
            { name: "ilan tournament", place: "first" },
            { name: "test tournament", place: "third" },
            { name: "test tournament", place: "5" },
            { name: "amaury tournament", place: "10" },
            { name: "hello tournament", place: "15" },
            { name: "asdf", place: "5" },
            { name: "hi", place: "7" },
            { name: "test tournament", place: "8" },
            { name: "test tournament", place: "12" },
            { name: "test tournament", place: "second" },
            { name: "test tournament", place: "second" },
            { name: "test tournament", place: "second" },

        ];
        const classics: ClassicRow[] = [
            { opponent: "amaury", score: "4 - 5" },
            { opponent: "amaury", score: "1 - 5" },
            { opponent: "amaury", score: "5 - 3" },
            { opponent: "amaury", score: "3 - 5" },
            { opponent: "amaury", score: "4 - 5" },
            { opponent: "amaury", score: "2 - 5" },
            { opponent: "amaury", score: "4 - 3" },
            { opponent: "amaury", score: "5 - 2" },
            { opponent: "amaury", score: "5 - 3" },
            { opponent: "amaury", score: "5 - 1" },
            { opponent: "amaury", score: "5 - 1" },
            { opponent: "amaury", score: "5 - 1" },
            { opponent: "amaury", score: "5 - 1" },

        ];

        // Colonnes: Tournoi | Classique
        const cols = document.createElement("div");
        cols.className = "grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0";

        // Colonne Tournoi
        const tournCol = document.createElement("div");
        tournCol.className = "flex flex-col h-full min-h-0";

        const tournHead = document.createElement("div");
        tournHead.className = "px-2 pb-2 mb-3 border-b border-white/10";

        const tournTitle = document.createElement("h3");
        tournTitle.className = "text-center text-white font-semibold";
        tournTitle.textContent = translations[getCurrentLang()].tournament;
        tournHead.appendChild(tournTitle);

        const tournList = document.createElement("ul");
        tournList.className = "flex-1 divide-y divide-white/10 overflow-y-auto overflow-x-hidden min-h-0 pr-1 scroll_bar";
        tournaments.forEach((row) => {
            const li = document.createElement("li");
            li.className = "grid grid-cols-[1fr_auto] gap-4 items-center py-2 px-2 text-white/90";
            const name = document.createElement("span");
            name.className = "truncate min-w-0";
            name.textContent = row.name;
            const place = document.createElement("span");
            place.className = "text-right text-white/70";
            place.textContent = row.place;
            li.appendChild(name);
            li.appendChild(place);
            tournList.appendChild(li);
        });
        tournCol.appendChild(tournHead);
        tournCol.appendChild(tournList);

        // Colonne Classique
        const classCol = document.createElement("div");
        classCol.className = "flex flex-col h-full min-h-0";
        const classHead = document.createElement("div");
        classHead.className = "px-2 pb-2 mb-3 border-b border-white/10";
        const classTitle = document.createElement("h3");
        classTitle.className = "text-center text-white font-semibold";
        classTitle.textContent = translations[getCurrentLang()].classic;
        classHead.appendChild(classTitle);
        const classList = document.createElement("ul");
        classList.className = "flex-1 divide-y divide-white/10 overflow-y-auto overflow-x-hidden min-h-0 pr-1 scroll_bar";
        classics.forEach((row) => {
            const li = document.createElement("li");
            li.className = "grid grid-cols-[1fr_auto] gap-4 items-center py-2 px-2 text-white/90";
            const vs = document.createElement("span");
            vs.className = "truncate min-w-0";
            vs.textContent = `vs ${row.opponent}`;
            const score = document.createElement("span");
            score.className = "text-right text-white/70";
            score.textContent = row.score;
            li.appendChild(vs);
            li.appendChild(score);
            classList.appendChild(li);
        });
        classCol.appendChild(classHead);
        classCol.appendChild(classList);

        cols.appendChild(tournCol);
        cols.appendChild(classCol);
        histBody.appendChild(cols);

        histCard.appendChild(histHeader);
        histCard.appendChild(histBody);
        bottom.appendChild(histCard);
 
    (async () => { const u = await GetData(); if (!u) return;
        name.textContent = u.username || u.uuid || "unknown";
        avatar.src = u.avatar || "/avatar/default_avatar.png";
        u.is_online == 1 ? status.classList.add("bg-green-600"): status.classList.add("bg-gray-600")
    })();

     main.appendChild(profileContainer);
 
     return main;
}
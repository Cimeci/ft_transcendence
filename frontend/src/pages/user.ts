import { getCurrentLang, t } from "./settings";
import { translations } from "../i18n";
import { getUser } from "../linkUser";

function getUuid(): string {
    const url = new URL(window.location.href);
    const uuid = url.searchParams.get("id") || "";
    return (uuid);
}

async function GetData() {
    const uuid = getUuid();
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
        const data = await resp.json();
        return (data.user);
    } catch(e) {console.error(e)};
}

async function GetBtnType(): Promise<number>{
    const uuid = getUuid();

	const currentUser = getUser();
	if (!currentUser) throw new Error("No user logged in");
    console.log("UUID", uuid);
    
	const me = currentUser.uuid;
	if (uuid === me) return (0);
    
    console.log("ME:", me);

    const token = localStorage.getItem("jwt");
    if (!token) throw new Error("Missing token");

    const resp = await fetch("/user/friendship", { headers: { Authorization: `Bearer ${token}` } });
	if (!resp.ok) throw new Error(String(resp.status));

	const data = await resp.json();
    console.log("DATA:", data);

	const rows = [
		...(data.friendship ?? []),
		...(data.sentRequest ?? []),
		...(data.receivedRequest ?? []),
	];
	console.log("ROWS:", rows);
    
	const relation = rows.find(
		(r) =>
			(r.user_id === me && r.friend_id === uuid) ||
			(r.friend_id === me && r.user_id === uuid)
	);
	console.log("FOUND RELATION:", relation);

    if (!relation) return 1;
    if (relation.status === "accepted") return 2;
    if (relation.status === "pending") return 3;

    return 5;
}

export function UserPage(): HTMLElement {
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
        bg.alt = "";
        bg.className = "absolute inset-0 w-full h-full object-cover";

        banner.appendChild(bg);

        const overlay = document.createElement("div");
        overlay.className = "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent";

        banner.appendChild(overlay);
        wrap.appendChild(banner);

        // card below banner
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
	    s1a.textContent = t.Total_game;

        const s1b = document.createElement("p");
	    s1b.className = "text-lg font-semibold";
	    s1b.textContent = "err";

        s1.appendChild(s1a); s1.appendChild(s1b);

        const s2 = document.createElement("div");
        s2.className = "flex flex-col items-center justify-center text-center gap-1";

        const s2a = document.createElement("p");
	    s2a.className = "text-xs uppercase text-white/60";
	    s2a.textContent = t.Win;

        const s2b = document.createElement("p");
	    s2b.className = "text-lg font-semibold";
	    s2b.textContent = "err";

        s2.appendChild(s2a); s2.appendChild(s2b);

        const s3 = document.createElement("div");
        s3.className = "flex flex-col items-right sm:items-center justify-center text-right sm:text-center gap-1";

        const s3a = document.createElement("p");
	    s3a.className = "text-xs uppercase text-white/60";
	    s3a.textContent = t.Lose;

        const s3b = document.createElement("p");
	    s3b.className = "text-lg font-semibold";
	    s3b.textContent = "err";

        s3.appendChild(s3a); s3.appendChild(s3b);

        stats.appendChild(s1); stats.appendChild(s2); stats.appendChild(s3);
        grid.appendChild(stats);

        const center = document.createElement("div");
        center.className = "flex flex-col items-center gap-2 justify-self-center";

        const avatarWrap = document.createElement("div");
        avatarWrap.className = "relative"
        
        const avatar = document.createElement("img");
        avatar.alt = "avatar";
        avatar.src = "/avatar/default_avatar.png"
        avatar.className = "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2";
        avatarWrap.appendChild(avatar)

        const status = document.createElement("span");
        status.className = "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-black/60";
        avatarWrap.appendChild(status);

        const name = document.createElement("h2");
        name.className = "text-white font-semibold text-lg";

        center.appendChild(avatarWrap);
        center.appendChild(name);
        grid.appendChild(center);

        const right = document.createElement("div");
        right.className = "w-full sm:w-auto flex flex-col items-end justify-center gap-3 sm:gap-4 text-white/90";

        const itemsRow = document.createElement("div");
        itemsRow.className = "flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full";

        // Active Bar
        const barWrap = document.createElement("div");
        barWrap.className = "flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-2";

        const barLabel = document.createElement("span");
        barLabel.className = "text-xs uppercase text-white/60";
        barLabel.textContent = t.bar;

        const barImg = document.createElement("img");
        barImg.src = "/bar/default_bar.png"; //! BAR USER LOOK
        barImg.alt = "bar";
        barImg.className = "h-6 sm:h-8 object-contain drop-shadow";

        barWrap.appendChild(barLabel);
        barWrap.appendChild(barImg);
 
        // Active Ball
        const ballWrap = document.createElement("div");
        ballWrap.className = "flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-2";

        const ballLabel = document.createElement("span");
        ballLabel.className = "text-xs uppercase text-white/60";
        ballLabel.textContent = t.ball;

        const ballImg = document.createElement("img");
        ballImg.src = "/ball/default_ball.png"; //! BALL USER LOOK
        ballImg.alt = "ball";
        ballImg.className = "w-6 h-6 sm:w-8 sm:h-8 object-contain drop-shadow";

        ballWrap.appendChild(ballLabel);
        ballWrap.appendChild(ballImg);
 
        itemsRow.appendChild(barWrap);
        itemsRow.appendChild(ballWrap);
        right.appendChild(itemsRow);

        { // CHANGE BTN
            const addBtn = document.createElement("button");
            addBtn.type = "button";
            addBtn.className = "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 duration-300 transition-all hover:scale-105 text-white text-sm shadow";
            addBtn.textContent = t.add;
            addBtn.addEventListener(("click"), async () => {
				const token = localStorage.getItem("jwt") || "";
 				addBtn.disabled = true;
 				const old = addBtn.textContent;
 				addBtn.textContent = "…";
				try {
                    const uuid = getUuid();
				    const resp = await fetch(`/user/friendship/${encodeURIComponent(uuid)}`, {
				        method: "POST",
				        headers: { Authorization: `Bearer ${token}` },
				    });
				    if (resp.ok) {
                        addBtn.textContent = t.requests_send;
                        window.location.reload();
				        return;
				    }
				    if (resp.status === 409) {
				        return;
				    }
				    if (resp.status === 401) {
				        alert(t.Session_expired);
				        addBtn.textContent = old;
				        return;
				    }
				    console.error("POST /friendship failed:", resp.status);
				    addBtn.textContent = old;
				} catch (e) {
				    console.error(e);
				    addBtn.textContent = old;
				} finally {
				    addBtn.disabled = false;
			}
			});

            const addIcon = document.createElement("img");
            addIcon.src = "/icons/plus.svg";
            addBtn.prepend(addIcon);

            const friendDiv = document.createElement("div");
            friendDiv.className = "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 duration-300 transition-all hover:scale-105 text-white text-sm shadow";
            friendDiv.textContent = t.friends;

            const friendIcon = document.createElement("img");
            friendIcon.src = "/icons/contact.svg";
            friendDiv.prepend(friendIcon);

            const WaitingDiv = document.createElement("div");
            WaitingDiv.className = "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 duration-300 transition-all hover:scale-105 text-white text-sm shadow";
            WaitingDiv.textContent = t.requests_send;

            const WaitingIcon = document.createElement("img");
            WaitingIcon.src = "/icons/timer.svg";
            WaitingDiv.prepend(friendIcon);

            (async () => {
                try {
                    await GetBtnType().then((res) => {
                        console.log("Résultat GetBtnType:", res);
                        if (res === 0) {}
                        else if (res === 1)
                            right.appendChild(addBtn);
                        else if (res === 2)
                            right.appendChild(friendDiv);
                        else if (res === 3)
                            right.appendChild(WaitingDiv);
                    });
                } catch (err) {
                    console.error("Erreur dans GetBtnType:", err);
                }
            })();
        }

        grid.appendChild(right);
    
        const bottom = document.createElement("div");
        bottom.className = "w-full mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6";
        profileContainer.appendChild(bottom);

        // Inventory card (left)
        function inventory(items: any[], grid: HTMLElement) {
            items.forEach(item => {
                if (item.usable === true){
                    const tile = document.createElement("div");
                    tile.className = "rounded-xl bg-white/5 border border-white/10 flex items-center justify-center h-24";
                    
                    const img = document.createElement("img");
                    img.src = item.id;
                    img.alt = item.name;
                    img.className = "max-w-full h-16 sm:h-20 object-contain drop-shadow";
                    
                    tile.appendChild(img);
                    grid.appendChild(tile);
                }
            })
        }

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

        const barsGrid = document.createElement("div"); //! ALL BARS USER LOOK
        barsGrid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6";
        let allBars = [{"id":"/playbar/default_bar.png","name":"default bar","type":"bar","price":0,"usable":true}]; // replace by user inventory bars
        invBody.appendChild(barsGrid);

        const ballsGrid = document.createElement("div"); //! ALL BALLS USER LOOK {
        ballsGrid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6";
        let allBalls = [{"src":"/ball/default_ball.png","id":"ball/default_ball.png","name":"default ball","type":"ball","price":0,"usable":true}]; // replace by user inventory balls
        invBody.appendChild(ballsGrid);
        
        const backgroundGrid = document.createElement("div"); //! ALL BACKGROUNDS USER LOOK
        backgroundGrid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4";
        let allBackgrounds = [{"src":"/bg/default_bg.png","id":"bg/default_bg.png","name":"default bg","type":"background","price":0,"usable":true}]; // replace by user inventory backgrounds
        invBody.appendChild(backgroundGrid);
        
        invCard.appendChild(invHeader);
        invCard.appendChild(invBody);
        bottom.appendChild(invCard);

        const histCard = document.createElement("section");
        histCard.className = "flex flex-col bg-white/10 backdrop-blur border border-white/10 rounded-2xl shadow-xl min-h-[45vh] max-h-[60vh]";
        
        const histHeader = document.createElement("div");
        histHeader.className = "px-4 sm:px-6 py-3 border-b border-white/10";
        
        const histTitle = document.createElement("h2");
        histTitle.className = "text-center text-white font-semibold";
        histTitle.textContent = t.history;
        histHeader.appendChild(histTitle);
        
        const histBody = document.createElement("div");
        histBody.className = "flex-1 p-4 sm:p-6 min-h-0";

        const cols = document.createElement("div");
        cols.className = "grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0";

        const tournCol = document.createElement("div");
        tournCol.className = "flex flex-col h-full min-h-0";

        const tournHead = document.createElement("div");
        tournHead.className = "px-2 pb-2 mb-3 border-b border-white/10";

        const tournTitle = document.createElement("h3");
        tournTitle.className = "text-center text-white font-semibold";
        tournTitle.textContent = t.tournament;
        tournHead.appendChild(tournTitle);

        const tournList = document.createElement("ul");
        tournList.className = "flex-1 divide-y divide-white/10 overflow-y-auto overflow-x-hidden min-h-0 pr-1 scroll_bar";
        let tournaments = [];
        function Tournaments(Tournaments: any[], List: HTMLElement) {
            Tournaments.forEach((tournament) => {
                const li = document.createElement("li");
                li.className = "grid grid-cols-[1fr_auto] gap-4 items-center py-2 px-2 text-white/90";

                const name = document.createElement("span");
                name.className = "truncate min-w-0";
                name.textContent = tournament.name;

                const place = document.createElement("span");
                place.className = "text-right text-white/70";
                place.textContent = tournament.place;

                li.appendChild(name);
                li.appendChild(place);
                List.appendChild(li);
            });
        }
        tournCol.appendChild(tournHead);
        tournCol.appendChild(tournList);

        const classCol = document.createElement("div");
        classCol.className = "flex flex-col h-full min-h-0";

        const classHead = document.createElement("div");
        classHead.className = "px-2 pb-2 mb-3 border-b border-white/10";

        const classTitle = document.createElement("h3");
        classTitle.className = "text-center text-white font-semibold";
        classTitle.textContent = t.classic;
        classHead.appendChild(classTitle);

        const classList = document.createElement("ul");
        classList.className = "flex-1 divide-y divide-white/10 overflow-y-auto overflow-x-hidden min-h-0 pr-1 scroll_bar";
        let games = [];
        function Games(Games: any[], List: HTMLElement, uuid: string) {
            Games.forEach((game) => {
                const li = document.createElement("li");
                li.className = "grid grid-cols-[1fr_auto] gap-4 items-center py-2 px-2 text-white/90";
                const vs = document.createElement("span");
                vs.className = "truncate min-w-0";
                if (game.player1_uuid === uuid)
                    vs.textContent = `vs ${game.player2}`;
                else
                    vs.textContent = `vs ${game.player1}`;
                const score = document.createElement("span");
                score.className = "text-right text-white/70";
                score.textContent = `${game.score1} - ${game.score2}`;
                li.appendChild(vs);
                li.appendChild(score);
                List.appendChild(li);
            });
        }

        classCol.appendChild(classHead);
        classCol.appendChild(classList);

        cols.appendChild(tournCol);
        cols.appendChild(classCol);
        histBody.appendChild(cols);

        histCard.appendChild(histHeader);
        histCard.appendChild(histBody);
        bottom.appendChild(histCard);
 
    (async () => { const u = await GetData(); if (!u) return;
        console.log('USER: ', u);
        name.textContent = u.username || u.uuid || "unknown";
        avatar.src = u.avatar_use?.[0]?.id;
        bg.src = u.background_use?.[0]?.id;
        barImg.src = u.paddle_use?.[0]?.id;
        ballImg.src = u.ball_use?.[0]?.id;

        const games_info = JSON.parse(u.games);
        s1b.textContent = games_info ? games_info.length : "0";
        s2b.textContent = u.game_ratio + "%";
	    s3b.textContent = String(100 - Number(u.game_ratio)) + "%";
        u.is_online == 1 ? status.classList.add("bg-green-600"): status.classList.add("bg-gray-600")
        u.is_online == 1 ? avatar.classList.add("ring-green-500/50"): avatar.classList.add("ring-gray-500/50")

        allBars = JSON.parse(u.paddle);
        allBalls = JSON.parse(u.ball);
        allBackgrounds = JSON.parse(u.background);

        inventory(allBars, barsGrid);
        inventory(allBalls, ballsGrid);
        inventory(allBackgrounds, backgroundGrid);
        games = JSON.parse(u.games);
        if (games)
            Games(games, classList, u.uuid);
        tournaments = JSON.parse(u.tournament);
        if (tournaments)
            Tournaments(tournaments, tournList);
    })()

     main.appendChild(profileContainer);
 
     return main;
}
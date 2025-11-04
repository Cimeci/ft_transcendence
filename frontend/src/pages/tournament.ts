import { t } from "./settings";
import { CreateWrappedButton, CreateSlider, Invitation, getUidInventory } from "../components/utils";
import { createInputWithEye, togglePassword } from "./register"; 
import { navigateTo } from "../routes";
import { createTournamentBracket } from "../components/bracket";
import { getUser } from "../linkUser";
import { GetData } from "./user";
import type { Friend } from "./friends";

let nb_players = {value: 16};

export type TournamentVisibility = 0 | 1;
//? 0 = public | 1 = private

interface Game {
	round: number,
	id: string,
}

export interface Players {
	uuid: string,
}

export interface Tournament {
	uuid: string,
	host: string,
	name: string,
	size: number,
	players: Players[],
	game: Game[],
	winner: string,
	visibility: number,
	password?: string,
}

export let tournamentList: Tournament[] = [];

async function GetTournamentList() {
    const jwt = localStorage.getItem("jwt");
    try {
        const resp = await fetch("/tournament/tournament", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Accept": "application/json",
				"Content-Type": "application/json",
            },
        });
     
        const text = await resp.text();
        
        if (!resp.ok) {
            console.error("Erreur lors de la récupération des tournois :", resp.status, resp.statusText);
            return null;
        }
        
        const ct = resp.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
            console.error("Réponse non-JSON reçue. Contenu:", text.substring(0, 200));
            return null;
        }
        
        const data: Tournament[] = JSON.parse(text);
        tournamentList = data;
        
    } catch (error) {
        console.error("Error network :", error);
    }
}

async function CreateTournament(btn: HTMLButtonElement, uuid_host:string, name: string, length: number, visibility: number, password?: string) {
    const token = localStorage.getItem("jwt") || "";
    btn.disabled = true;
    const old = btn.textContent;
    btn.textContent = "…";
    try {
		console.log("VALUE CREATE TOURNAMENT :", uuid_host, "| ", name, " |", length)	
        const resp = await fetch(`/tournament/tournament`, {
          	method: "POST",
          	headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ host_uuid: uuid_host, name: name, visibility: visibility, password: password, length: length })
        });
		console.log("RESP", resp);
        if (resp.ok) {
			const data = await resp.json();
			console.log("DATA: ", data)
          	return (data);
        }
        if (resp.status === 400) { btn.textContent = "Invalid Input"; return; }
        if (resp.status === 401) { alert(t.Session_expired); btn.textContent = old; return; }
        console.error("POST /tournament failed:", resp.status);
        btn.textContent = old;
    } catch (e) {
        console.error(e);
        btn.textContent = old;
    } finally {
        btn.disabled = false;
    }
}

export function getUuid(): string {
    const url = new URL(window.location.href);
    const uuid = url.searchParams.get("uid") || "";
    return (uuid);
}

async function getCurrentTournament(): Promise<Tournament | undefined> {
    try {
        await GetTournamentList();
        const uuid = getUuid();
        console.log("UUID :", uuid);
        console.log("TOURNAMENTLIST :", tournamentList);
        
        if (!uuid) {
            console.error("Aucun UUID trouvé dans l'URL");
            return undefined;
        }
        
        const tournament = tournamentList.find(tournament => tournament.uuid === uuid);
        console.log("TOURNAMENT FIND: ", tournament);
        return tournament;
    } catch (error) {
        console.error("Erreur dans getCurrentTournament:", error);
        return undefined;
    }
}

async function getPlayerNames(uuids: string[]): Promise<string[]> {
    try {
        const names = await Promise.all(
            uuids.map(async (uuid) => {
                try {
                    const userData = await GetData(uuid);
                    return userData?.username || `Player ${uuid.slice(0, 8)}`;
                } catch (error) {
                    console.error(`Erreur lors de la récupération de l'utilisateur ${uuid}:`, error);
                    return `Player ${uuid.slice(0, 8)}`;
                }
            })
        );
        return names;
    } catch (error) {
        console.error("Erreur dans getPlayerNames:", error);
        // Fallback: retourner les UUID si erreur
        return uuids.map(uuid => `Player ${uuid.slice(0, 8)}`);
    }
}

function setupBracketAutoRefresh(tournamentUUID: string, bracketContainer: HTMLElement, interval: number = 60000) {
    const refreshInterval = setInterval(async () => {
        try {
            await GetTournamentList();
            const updatedTournament = tournamentList.find(t => t.uuid === tournamentUUID);
            if (updatedTournament) {
                updateBracketDisplay(updatedTournament, bracketContainer);
            }
        } catch (error) {
            console.error("Error refreshing bracket:", error);
        }
    }, interval);

    window.addEventListener('beforeunload', () => {
        clearInterval(refreshInterval);
    });

    return refreshInterval;
}

async function updateBracketDisplay(tournament: Tournament, bracketContainer: HTMLElement) {
    const playerArray = parsePlayer(tournament);
    let players: string[] = [];

    if (Array.isArray(playerArray) && playerArray.length > 0) {
        const playerUuids = playerArray.map(p => p.uuid);
        players = await getPlayerNames(playerUuids);
    } else {
        players = Array.from({ length: tournament.size }, (_, i) => `${t.player} ${i + 1}`);
    }

    bracketContainer.innerHTML = "";
    const newBracket = createTournamentBracket(players);
    newBracket.classList.add("mt-15", "pl-5");
    bracketContainer.appendChild(newBracket);
}

function parsePlayer(tournament: Tournament): Players[] {
    const playersData = tournament?.players;
    let playerArray: Players[] = [];

    try {
        if (typeof playersData === 'string') {
            playerArray = JSON.parse(playersData);
        } else if (Array.isArray(playersData)) {
            playerArray = playersData;
        }
    } catch (error) {
        console.error("Erreur lors du parsing des joueurs:", error);
        playerArray = [];
    }

    return Array.isArray(playerArray) ? playerArray : [];
}

async function JoinTournament(tournament: Tournament): Promise<boolean> {
	const jwt = localStorage.getItem("jwt");
	if (!jwt)
		return false;
	try {
		const resp = await fetch('/tournament/join', {
    		method: 'PATCH',
    		headers: {
				"Authorization": `Bearer ${jwt}`,
    	  		'Content-Type': 'application/json',
    		},
    		body: JSON.stringify({ uuid_tournament: tournament.uuid })
  		});

  		if (resp.ok) {
			await GetTournamentList();
    		return (true);
  		} else {
    		console.log('Error Patch join', resp.status);
			const errorData = await resp.json();
            console.log('Error details:', errorData);
  		}
	} catch (e) {
		console.error("ERROR PATCH join", e);
	}
	return (false);
}

//! QUIT TOURNAMENT
async function QuitTournament(tournament: Tournament): Promise<boolean>{
	const jwt = localStorage.getItem("jwt");
	if (!jwt)
		return false;
	try {
		const resp = await fetch('/tournament/tournament_players', {
    		method: 'DELETE',
    		headers: {
				"Authorization": `Bearer ${jwt}`,
    	  		'Content-Type': 'application/json',
    		},
    		body: JSON.stringify({ uuid_tournament: tournament.uuid })
  		});

  		if (resp.ok) {
			await GetTournamentList();
    		return (true);
  		} else {
    		console.log('Error Patch delete', resp.status);
			const errorData = await resp.json();
            console.log('Error details:', errorData);
  		}
	} catch (e) {
		console.error("ERROR PATCH delete", e);
	}
	return (false);
}

//! QUIT PLAYERS TOURNAMENT
async function QuitPLayersTournament(tournament: Tournament): Promise<boolean>{
	const jwt = localStorage.getItem("jwt");
	if (!jwt)
		return false;
	try {
		const resp = await fetch('/tournament/tournament_players', {
    		method: 'DELETE',
    		headers: {
				"Authorization": `Bearer ${jwt}`,
    	  		'Content-Type': 'application/json',
    		},
    		body: JSON.stringify({ uuid_tournament: tournament.uuid })
  		});

  		if (resp.ok) {
			await GetTournamentList();
    		return (true);
  		} else {
    		console.log('Error Patch delete', resp.status);
			const errorData = await resp.json();
            console.log('Error details:', errorData);
  		}
	} catch (e) {
		console.error("ERROR PATCH delete", e);
	}
	return (false);
}

export function PongTournamentMenuPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "pt-25 min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

	const Title = document.createElement("h1");
	Title.className = "absolute tracking-widest text-6xl neon-matrix top-25";
	Title.textContent = t.tournament;
	mainContainer.appendChild(Title);

	const TournamentContainer = document.createElement("div");
    TournamentContainer.className = "flex flex-col mt-20 lg:flex-row items-center justify-center gap-20 w-full px-4";

    const HostContainer = document.createElement("div");
    HostContainer.className = "flex flex-col text-center items-center justify-center border-2 rounded-xl p-10 gap-8 w-[90vw] lg:w-[40vw] h-[70vh] min-h-[20rem] overflow-hidden";

	const HostTitle = document.createElement("h2");
	HostTitle.className = "top-2 neon-matrix";
	HostTitle.textContent = t.host;
	HostContainer.appendChild(HostTitle);

	HostContainer.appendChild(CreateSlider(nb_players, t.player_number, 2, 16)); // add render function for db

	const GameName = document.createElement("input");
	GameName.className = "w-9/10 border-2 rounded-xl text-xl p-2";
	GameName.placeholder = t.tournament_name;
	GameName.maxLength = 20;
	HostContainer.appendChild(GameName);

	const GamePassword = document.createElement("input");
	GamePassword.className = "w-9/10 border-2 rounded-xl text-xl p-2";
	GamePassword.placeholder = t.password;
	GamePassword.type = "password";

    const EyePassword = document.createElement("img");
    EyePassword.className = "absolute right-12 top-1/5 cursor-pointer w-7 h-7 duration-300 transition-all hover:scale-110";
    EyePassword.src = "/icons/eye-off.svg";
    EyePassword.alt = "Show/Hide";
    EyePassword.onclick = () => togglePassword(GamePassword, EyePassword);

    const PasswordWrapper = createInputWithEye(GamePassword, EyePassword);
    HostContainer.appendChild(PasswordWrapper);

	const toggleBtn = document.createElement("label");
	toggleBtn.className = "inline-flex items-center cursor-pointer";

	const toggleSpan1 = document.createElement("span");
	toggleSpan1.className = "mr-3 text-xl font-large text-gray-900 dark:text-gray-300";
	toggleSpan1.textContent = t.public;
	toggleBtn.appendChild(toggleSpan1);

	const toggleInput = document.createElement("input");
	toggleInput.type = "checkbox";
	toggleInput.value = "";
	toggleInput.className = "sr-only peer";
	toggleBtn.appendChild(toggleInput);

	const toggleDiv = document.createElement("div");
	toggleDiv.className = "relative w-16 h-9 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600";
	toggleBtn.appendChild(toggleDiv);
	
	const toggleSpan2 = document.createElement("span");
	toggleSpan2.className = "ml-3 text-xl font-large text-gray-900 dark:text-gray-300";
	toggleSpan2.textContent = t.private;
	toggleBtn.appendChild(toggleSpan2);

	HostContainer.appendChild(toggleBtn);

    PasswordWrapper.classList.toggle('hidden', !toggleInput.checked);

    toggleDiv.tabIndex = 0;
    toggleDiv.setAttribute('role', 'switch');
    const syncAria = () => toggleDiv.setAttribute('aria-checked', String(toggleInput.checked));
    syncAria();

    const onToggleKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            toggleInput.checked = !toggleInput.checked;
            toggleInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };
    toggleDiv.addEventListener('keydown', onToggleKey);
    toggleInput.addEventListener('keydown', onToggleKey);

    toggleInput.addEventListener('change', () => {
        const isPrivate = toggleInput.checked;
        PasswordWrapper.classList.toggle('hidden', !isPrivate);
        if (!isPrivate) GamePassword.value = "";
		syncAria();
    });

	const HostBtn = document.createElement("button");
	HostBtn.className = "h-[7vh] w-9/10 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:scale-102 duration-300 transition-all";
	HostBtn.textContent = t.host;
    HostBtn.addEventListener("click", async () => {
		if (!GameName.value)
		{
			GameName.classList.add("text-red-600", "shake");
			GameName.placeholder = t.empty_input;
			setTimeout(() => {GameName.placeholder = t.tournament_name; GameName.classList.remove("text-red-600", "shake");}, 1000)
		}
		if (!GamePassword.value)
		{
			GamePassword.classList.add("text-red-600", "shake");
			GamePassword.placeholder = t.empty_input;
			EyePassword.classList.add("shake");
			setTimeout(() => {
				GamePassword.placeholder = t.password;
				GamePassword.classList.remove("text-red-600", "shake");
				EyePassword.classList.remove("shake");
			}, 1000)
		}
		if (GameName.value)
		{
			const visibility: TournamentVisibility = toggleInput.checked ? 1 : 0;
			if (visibility === 0 || visibility === 1 && GamePassword.value)
			{
				const uuid = getUser()?.uuid || 'err';
                const tournament_data = await CreateTournament(HostBtn, uuid, GameName.value, nb_players.value, visibility, GamePassword.value);
				if (tournament_data && tournament_data.uuid){
    				const tournament_uid = tournament_data.uuid;
                	renderJoinList();

                	GameName.value = "";
                	GamePassword.value = "";
                	PasswordWrapper.classList.toggle("hidden", !toggleInput.checked);
                	mainContainer.classList.add("fade-out");
                	setTimeout(() => { navigateTo(`/Tournament/host?uid=${tournament_uid}`); }, 1000);
				}
            }
        }
    });
    HostContainer.appendChild(HostBtn);

	const JoinContainer = document.createElement("div");
    JoinContainer.className = "flex flex-col items-center justify-center border-2 rounded-xl p-10 w-[90vw] lg:w-[40vw] h-[70vh] min-h-[20rem] overflow-hidden";

	const JoinTitle = document.createElement("h2");
	JoinTitle.className = "top-2 neon-matrix";
	JoinTitle.textContent = t.join;
	JoinContainer.appendChild(JoinTitle);

	let currentJoinForm: HTMLElement | null = null;

	function createFormJoin(tournament: Tournament) : HTMLElement {
		const JoinForm = document.createElement("div");
		JoinForm.className = "mt-5 hover:scale-102 duration-300 transition-all join-form relative w-full flex flex-col gap-5 bg-black/40 rounded-xl p-10";	

		const closeBtn = document.createElement("button");
		closeBtn.type = "button";
		closeBtn.setAttribute("aria-label", "Close");
		closeBtn.innerHTML = '<img src="/icons/cross.svg"></img>';
		closeBtn.className = "absolute top-0 right-0 w-8 h-8 leading-7 text-center text-white/80 hover:text-white hover:scale-110 transition";
		closeBtn.addEventListener("click", () => {
			currentJoinForm = null;
			JoinForm.remove();
		});
		JoinForm.appendChild(closeBtn);

		const PasswordInputJoin = document.createElement("input");
		PasswordInputJoin.className = "w-full border-2 rounded-xl text-xl p-2 pr-12 duration-300 transition-all focus:scale-102";
		PasswordInputJoin.placeholder = t.password;
		PasswordInputJoin.type = "password";	

		const EyePasswordJoin = document.createElement("img");
		EyePasswordJoin.className = "absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer w-7 h-7 duration-300 transition-all hover:scale-110";
		EyePasswordJoin.src = "/icons/eye-off.svg";
		EyePasswordJoin.alt = "Show/Hide";
		EyePasswordJoin.onclick = () => togglePassword(PasswordInputJoin, EyePasswordJoin);
		JoinForm.appendChild(createInputWithEye(PasswordInputJoin, EyePasswordJoin));	

		const ConfirmJoinBtn = document.createElement("button");
		ConfirmJoinBtn.className = "h-[7vh] btn-fluid bg-green-600 text-white rounded-xl hover:scale-102 hover:bg-green-700 transition-all";
		ConfirmJoinBtn.textContent = t.join;
		ConfirmJoinBtn.addEventListener("click", () => {
			if (!tournament.password || PasswordInputJoin.value === tournament.password) {
				mainContainer.classList.add("fade-out");
				if (tournament.host === getUser()?.uuid)
					setTimeout(() => navigateTo(`/Tournament/host?uid=${tournament.uuid}`), 1000);
				else
                	setTimeout(() => navigateTo(`/Tournament/join?uid=${tournament.uuid}`), 1000);
			} else {
				ConfirmJoinBtn.classList.add("shake")
				setTimeout(() => {ConfirmJoinBtn.classList.remove("shake")}, 600)
			}
		});
		JoinForm.appendChild(ConfirmJoinBtn);

		return (JoinForm);
	}

	const titleList = document.createElement("div");
	titleList.className = "p-2 mt-5 w-full justify-around text-center items-center flex tracking-widest";
	const tname = document.createElement("p");
	tname.className = "w-1/3";
	tname.textContent = t.name;
	titleList.appendChild(tname);
	const tnb = document.createElement("p");
	tnb.className = "w-1/3";
	tnb.textContent = t.nbplayer;
	titleList.appendChild(tnb);
	const tvis = document.createElement("p");
	tvis.className = "w-1/3";
	tvis.textContent = t.visibilty;
	titleList.appendChild(tvis);
	JoinContainer.appendChild(titleList)

	const JoinList = document.createElement("ul");
	JoinList.className = "gap-10 p-2 text-center w-full flex-1 min-h-0 overflow-y-auto border-2 rounded-xl overflow-x-hidden";
	JoinContainer.appendChild(JoinList);

	GetTournamentList().then(() => {console.log("TOURNAMENTLIST LIST: ", tournamentList); renderJoinList()});
	const renderJoinList = () => {
		JoinList.innerHTML = "";
		tournamentList.forEach(tournament => {
    		const li = document.createElement("li");
    		li.className = "justify-around text-center items-center flex tracking-widest cursor-pointer hover:text-green-600 hover:scale-102 duration-300 transition-all min-h-12 p-2";

    		const renderLabel = () => {
				li.innerHTML = "";
				const tname = document.createElement("p");
				tname.className = "w-1/3";
				tname.textContent = tournament.name;
				li.appendChild(tname);

				const tnb = document.createElement("p");
				tnb.className = "w-1/3";
				
            	const playerCount = parsePlayer(tournament);
            	console.log("TOURNAMENT PLAYER: ", playerCount);
            	tnb.textContent = `${playerCount.length}/${tournament.size}`;
            	li.appendChild(tnb);

				const tvis = document.createElement("p");
				tvis.className = "w-1/3";
				tvis.textContent = tournament.visibility === 1 ? t.private: t.public;
				li.appendChild(tvis);
    		};
			console.log("TOURNAMENT LENGHT", tournament.size , parsePlayer(tournament).length)
			if (tournament.size > parsePlayer(tournament).length)
    			renderLabel();

    		li.addEventListener("click", () => {
      			JoinContainer.querySelectorAll(".join-form").forEach(el => el.remove());
				
				if (currentJoinForm) {
					currentJoinForm.remove();
					currentJoinForm = null;
				}
                if (tournament.visibility === 1) {
					const form = createFormJoin(tournament);
					currentJoinForm = form;
					JoinList.insertAdjacentElement("afterend", form);
					form.scrollIntoView({ behavior: "smooth", block: "nearest" });
                } else {
                    mainContainer.classList.add("fade-out");
					JoinTournament(tournament);
					if (tournament.host === getUser()?.uuid)
						setTimeout(() => navigateTo(`/Tournament/host?uid=${tournament.uuid}`), 1000);
					else
                    	setTimeout(() => navigateTo(`/Tournament/join?uid=${tournament.uuid}`), 1000);
                }
      			setTimeout(renderLabel, 1000);
    		});
    		JoinList.appendChild(li);
  		});
	};

	renderJoinList();
	
	TournamentContainer.appendChild(HostContainer); 
	TournamentContainer.appendChild(JoinContainer);
	mainContainer.appendChild(TournamentContainer);

	return (mainContainer);
}

export function PongTournamentPageJoin(): HTMLElement {
    let currentTournament: Tournament | undefined;
	let refreshInterval: number | null = null;
	let hostname = "hostname";
	
    const mainContainer = document.createElement("div");
    mainContainer.className = "gap-5 z-[2000] min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

    const loadingContainer = document.createElement("div");
    loadingContainer.className = "flex items-center justify-center";
    loadingContainer.innerHTML = `<p>${t.login} ${t.tournament}...</p>`;
    mainContainer.appendChild(loadingContainer);

    async function initializeTournament() {
        try {
            currentTournament = await getCurrentTournament();
            console.log("CURRENT : ", currentTournament);
			const inv = await getUidInventory(currentTournament?.host || "err");
			if (inv)
				hostname = inv.username;		
			await renderTournament();
			
        } catch (error) {
            console.error("Erreur lors du chargement du tournoi:", error);
            loadingContainer.innerHTML = "<p>Erreur lors du chargement du tournoi</p>";
        }
    }

    async function renderTournament() {
    	loadingContainer.remove();

    	const Title = document.createElement("h1");
    	Title.className = "absolute top-5 tracking-widest text-6xl neon-matrix mb-15";
    	Title.textContent = currentTournament?.name + " " + t.tournament;
    	mainContainer.appendChild(Title);

		const hostName = document.createElement("h1");
		hostName.className = "absolute top-5 left-5 tracking-widest text-2xl neon-matrix mb-15";
		hostName.textContent = t.host + ": " + hostname;
		mainContainer.appendChild(hostName);

    	const size = currentTournament?.size ?? nb_players.value;
		
    	const playerArray = parsePlayer(currentTournament!);
    	let players: string[] = [];

    	if (Array.isArray(playerArray) && playerArray.length > 0) {
    	    const playerUuids = playerArray.map(p => p.uuid);
    	    players = await getPlayerNames(playerUuids);
    	} else {
    	    players = Array.from({ length: size }, (_, i) => `${t.player} ${i + 1}`);
    	}

    	const bracketContainer = createTournamentBracket(players);
		bracketContainer.id = "bracket-container";
    	bracketContainer.classList.add("mt-15", "pl-5");
    	mainContainer.appendChild(bracketContainer);

		await updateBracketDisplay(currentTournament!, bracketContainer);

		if (currentTournament)
            refreshInterval = setupBracketAutoRefresh(currentTournament.uuid, bracketContainer);

		const rightContainer = document.createElement("div");
		rightContainer.className = "p-2 fixed top-0 right-0 h-full min-w-3/20 glass-blur flex flex-col gap-3 justify-between items-center";
		rightContainer.classList.add("hidden");
		mainContainer.appendChild(rightContainer);

		const btnRightBar = document.createElement("button");
		btnRightBar.className = "top-5 right-5 w-10 h-10 fixed z-[2000] cursor-pointer hover:scale-105 duration-200 transition-all";
		btnRightBar.onclick = () => {
			if (rightContainer.classList.contains("hidden")) {
				btnRightBar.classList.remove("right-5");
    			btnRightBar.classList.add("right-[calc(15%+1.25rem)]");
				rightContainer.classList.remove("hidden");
			} else {
				btnRightBar.classList.remove("right-[calc(15%+1.25rem)]");
   				btnRightBar.classList.add("right-5");
				btnRightBar.classList.remove("right-3/10");
				rightContainer.classList.add("hidden");
			}
		}
		mainContainer.appendChild(btnRightBar);

		const iconRightBar = document.createElement("img");
		iconRightBar.className = "w-full h-full"
		iconRightBar.src = "/icons/list.svg"
		btnRightBar.appendChild(iconRightBar);

		const lstFriends = document.createElement("ul");
		lstFriends.className = "glass-blur w-9/10 h-full overflow-y-auto divide-y";
		rightContainer.appendChild(lstFriends);

		let friendData: Friend[] = [];

		const token = localStorage.getItem("jwt") || "";
		(async () => {
		  	try {
		  	  	const resp = await fetch("/user/friendship", { headers: { Authorization: `Bearer ${token}` } });
		  	  	if (!resp.ok) throw new Error(String(resp.status));

		  	  	const data = await resp.json();
		  	  	const me = getUser()?.uuid;
				const rows = (data?.friendship ?? []) as Array<{ user_id: string; friend_id: string }>;

				console.log("DATA FRIEND RESP :", data);
				console.log("DATA FRIEND ME :", me);
				console.log("DATA FRIEND ROWS :", rows);

				const list = await Promise.all(rows.map(async (r) => {
		  	  	  	const other = r.user_id === me ? r.friend_id : r.user_id;
		  	  	  	try {
		  	  	  	  	const r2 = await fetch(`/user/${encodeURIComponent(other)}`, {
		  	  	  	  	  	headers: { Authorization: `Bearer ${token}` }
		  	  	  	  	});
		  	  	  	  	if (r2.ok) {
		  	  	  	  	  	const { user } = await r2.json();
		  	  	  	  	  	return {
		  	  	  	  	  	  	id: other,
		  	  	  	  	  	  	username: user.username || other,
		  	  	  	  	  	  	invitation: t.friends,
		  	  	  	  	  	  	avatar: user.avatar_use[0].id || "/avatar/default_avatar.png"
		  	  	  	  	  	};
		  	  	  	  	}
		  	  	  	} catch {}
		  	  	  	return { id: other, username: other, invitation: t.friends, avatar: "/avatar/default_avatar.png" };
		  	  	}));
		  	  	friendData = list;
		  	} catch (e) {
		  	  	console.error("load friendship failed", e);
		  	  	friendData = [];
		  	}
			console.log("FRIEND DATA: ", friendData);
			friendData.forEach(e => {
			const li: HTMLLIElement = document.createElement("li");
			li.className = "flex justify-between items-center p-2 w-full min-h-12"

			const profil = document.createElement("div");{
			profil.className = "flex gap-2 justify-center items-center";
			li.appendChild(profil);

			const icon = document.createElement("img");
			icon.src = e.avatar;
			icon.className = "w-8 h-8 rounded-full object-cover";
			profil.appendChild(icon);

			const name = document.createElement("p");
			name.className = "text-base";
			name.textContent = e.username;
			profil.appendChild(name);
			}

			const btn = document.createElement("button");
			btn.className = "inline-flex px-3 py-1.5 rounded-lg duration-300 transition-all hover:scale-105 bg-green-500 hover:bg-green-600";
			btn.textContent = t.invite;
			btn.addEventListener("click", async () => {
			    console.log("BODY INVITATION: ", currentTournament?.uuid, " |", e.id);
			
			    if (!currentTournament?.uuid) {
			        console.error("No tournament UUID");
			        btn.textContent = t.error;
			        return;
			    }
			
			    btn.textContent = "...";
			    btn.disabled = true;
			
			    try {
			        const check = await Invitation(currentTournament.uuid, e.id, "tournament");
				
			        if (check === true) {
			            btn.textContent = t.requests_send;
			            btn.disabled = true;
			            btn.style.backgroundColor = "#00ff08ff";
			        } else {
			            btn.textContent = t.error;
			            btn.disabled = false;
			            // Réinitialiser après 2 secondes
			            setTimeout(() => {
			                btn.textContent = t.invite;
			                btn.disabled = false;
			            }, 2000);
			        }
			    } catch (error) {
			        console.error("Invitation error:", error);
			        btn.textContent = t.error;
			        btn.disabled = false;
			        // Réinitialiser après 2 secondes
			        setTimeout(() => {
			            btn.textContent = t.invite;
			            btn.disabled = false;
			        }, 2000);
			    }
			});
			li.appendChild(btn);
			lstFriends.appendChild(li);
		});

		})();


		const BackToMenuOverlay = document.createElement("div");
		BackToMenuOverlay.className = "fixed inset-0 z-[2000] hidden bg-black/60 flex items-center justify-center p-4";

		const BackToMenuSure = document.createElement("div");
		BackToMenuSure.className = "w-[100vw] text-center gap-6 justify-center items-center rounded-xl p-8 flex flex-col";

		const BackToMenuTitle = document.createElement("h1");
		BackToMenuTitle.className = "text-5xl neon-matrix";
		BackToMenuTitle.textContent = t.title_leave;
		BackToMenuSure.appendChild(BackToMenuTitle);

		const BackToMenuTxt = document.createElement("p");
		BackToMenuTxt.className = "";
		BackToMenuTxt.textContent = t.txt_leave;
		BackToMenuSure.appendChild(BackToMenuTxt);

		const actions = document.createElement("div");
		actions.className = "flex gap-4 justify-center";

		const CancelBtn = document.createElement("button");
		CancelBtn.className = "px-4 py-2 rounded-xl border border-gray-300 hover:scale-110 transition-all duration-300";
		CancelBtn.textContent = t.cancel;
		CancelBtn.onclick = () => {
			BackToMenuOverlay.classList.add("hidden")
		};
		actions.appendChild(CancelBtn);

		const ConfirmBtn = document.createElement("button");
		ConfirmBtn.className = "px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-all duration-300";
		ConfirmBtn.textContent = t.back;
		ConfirmBtn.onclick = () => {
			//! QuitPlayersTournament(currentTournament);
			//! QUIT TOURNAMENT
			mainContainer.classList.add("fade-out");
			setTimeout(() => {navigateTo("/Tournament/menu");}, 1000);
		};
		actions.appendChild(ConfirmBtn);

		BackToMenuSure.appendChild(actions);
		BackToMenuOverlay.appendChild(BackToMenuSure);
		mainContainer.appendChild(BackToMenuOverlay);

		const BackToMenuBtn = CreateWrappedButton(mainContainer, t.back, "null", 1);
		BackToMenuBtn.addEventListener("click", (e) => {
			e.preventDefault();
			BackToMenuOverlay.classList.remove("hidden");
		})
    	rightContainer.appendChild(BackToMenuBtn);

		BackToMenuOverlay.addEventListener("click", (e) => {
  			if (e.target === BackToMenuOverlay) BackToMenuOverlay.classList.add("hidden");
		});

		const onEsc = (e: KeyboardEvent) => {
  			if (e.key === "Escape") BackToMenuOverlay.classList.add("hidden");
		};
		document.addEventListener("keydown", onEsc);
	}

    mainContainer.addEventListener('DOMNodeRemoved', () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    });

	initializeTournament();

    return (mainContainer);
}

export function PongTournamentPageHost(): HTMLElement {

	let currentTournament: Tournament | undefined;

    const mainContainer = document.createElement("div");
    mainContainer.className = "gap-5 z-[2000] min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

	const loadingContainer = document.createElement("div");
    loadingContainer.className = "flex items-center justify-center";
    loadingContainer.innerHTML = "<p>Chargement du tournoi...</p>";
    mainContainer.appendChild(loadingContainer);

	async function initializeTournament() {
        try {
            currentTournament = await getCurrentTournament();
            console.log("CURRENT TOURNAMENT HOST: ", currentTournament);
            
            renderTournament();
        } catch (error) {
            console.error("Erreur lors du chargement du tournoi:", error);
            loadingContainer.innerHTML = "<p>Erreur lors du chargement du tournoi</p>";
        }
    }

	async function renderTournament() {
    	loadingContainer.remove();

    	const Title = document.createElement("h1");
    	Title.className = "absolute top-5 tracking-widest text-6xl neon-matrix mb-15";
    	Title.textContent = currentTournament?.name + " " + t.tournament;
    	mainContainer.appendChild(Title);

    	const size = currentTournament?.size ?? nb_players.value;
		
    	const playerArray = parsePlayer(currentTournament!);
    	let playerUuids: string[] = [];

    	if (Array.isArray(playerArray) && playerArray.length > 0) {
    	    playerUuids = playerArray.map(p => p.uuid);
    	}

    	let players: string[];
    	if (playerUuids.length > 0) {
    	    players = await getPlayerNames(playerUuids);
    	} else {
    	    players = Array.from({ length: size }, (_, i) => `${t.player} ${i + 1}`);
    	}

    	console.log("PLAYERS WITH NAMES:", players);
	
    	const bracketContainer = createTournamentBracket(players);
    	bracketContainer.className = "mt-15 pl-5 w-full";
    	const renderBracket = () => {
    	    bracketContainer.innerHTML = "";
    	    const b = createTournamentBracket(players);
    	    b.classList.add("mt-0", "pl-0");
    	    bracketContainer.appendChild(b);
    	};

		const rightContainer = document.createElement("div");
		rightContainer.className = "p-2 fixed top-0 right-0 h-full min-w-3/20 glass-blur flex flex-col gap-3 justify-between items-center";
		mainContainer.appendChild(rightContainer);

		const btnRightBar = document.createElement("button");
		btnRightBar.className = "top-5 right-[calc(15%+1.25rem)] w-10 h-10 fixed z-[2000] cursor-pointer hover:scale-105 duration-200 transition-all";
		btnRightBar.onclick = () => {
			if (rightContainer.classList.contains("hidden")) {
				btnRightBar.classList.remove("right-5");
    			btnRightBar.classList.add("right-[calc(15%+1.25rem)]");
				rightContainer.classList.remove("hidden");
			} else {
				btnRightBar.classList.remove("right-[calc(15%+1.25rem)]");
   				btnRightBar.classList.add("right-5");
				btnRightBar.classList.remove("right-3/10");
				rightContainer.classList.add("hidden");
			}
		}
		mainContainer.appendChild(btnRightBar);

		const iconRightBar = document.createElement("img");
		iconRightBar.className = "w-full h-full"
		iconRightBar.src = "/icons/list.svg"
		btnRightBar.appendChild(iconRightBar);

		const lstFriends = document.createElement("ul");
		lstFriends.className = "glass-blur w-9/10 h-full overflow-y-auto divide-y";
		rightContainer.appendChild(lstFriends);

		let friendData: Friend[] = [];

		const token = localStorage.getItem("jwt") || "";
		(async () => {
		  	try {
		  	  	const resp = await fetch("/user/friendship", { headers: { Authorization: `Bearer ${token}` } });
		  	  	if (!resp.ok) throw new Error(String(resp.status));

		  	  	const data = await resp.json();
		  	  	const me = getUser()?.uuid;
				const rows = (data?.friendship ?? []) as Array<{ user_id: string; friend_id: string }>;

				console.log("DATA FRIEND RESP :", data);
				console.log("DATA FRIEND ME :", me);
				console.log("DATA FRIEND ROWS :", rows);

				const list = await Promise.all(rows.map(async (r) => {
		  	  	  	const other = r.user_id === me ? r.friend_id : r.user_id;
		  	  	  	try {
		  	  	  	  	const r2 = await fetch(`/user/${encodeURIComponent(other)}`, {
		  	  	  	  	  	headers: { Authorization: `Bearer ${token}` }
		  	  	  	  	});
		  	  	  	  	if (r2.ok) {
		  	  	  	  	  	const { user } = await r2.json();
		  	  	  	  	  	return {
		  	  	  	  	  	  	id: other,
		  	  	  	  	  	  	username: user.username || other,
		  	  	  	  	  	  	invitation: t.friends,
		  	  	  	  	  	  	avatar: user.avatar_use[0].id || "/avatar/default_avatar.png"
		  	  	  	  	  	};
		  	  	  	  	}
		  	  	  	} catch {}
		  	  	  	return { id: other, username: other, invitation: t.friends, avatar: "/avatar/default_avatar.png" };
		  	  	}));
		  	  	friendData = list;
		  	} catch (e) {
		  	  	console.error("load friendship failed", e);
		  	  	friendData = [];
		  	}
			console.log("FRIEND DATA: ", friendData);
			friendData.forEach(e => {
			const li: HTMLLIElement = document.createElement("li");
			li.className = "flex justify-between items-center p-2 w-full min-h-12"

			const profil = document.createElement("div");{
			profil.className = "flex gap-2 justify-center items-center";
			li.appendChild(profil);

			const icon = document.createElement("img");
			icon.src = e.avatar;
			icon.className = "w-8 h-8 rounded-full object-cover";
			profil.appendChild(icon);

			const name = document.createElement("p");
			name.className = "text-base";
			name.textContent = e.username;
			profil.appendChild(name);
			}

			const btn = document.createElement("button");
			btn.className = "inline-flex px-3 py-1.5 rounded-lg duration-300 transition-all hover:scale-105 bg-green-500 hover:bg-green-600";
			btn.textContent = t.invite;
			btn.addEventListener("click", async () => {
			    console.log("BODY INVITATION: ", currentTournament?.uuid, " |", e.id);
			
			    if (!currentTournament?.uuid) {
			        console.error("No tournament UUID");
			        btn.textContent = t.error;
			        return;
			    }
			
			    btn.textContent = "...";
			    btn.disabled = true;
			
			    try {
			        const check = await Invitation(currentTournament.uuid, e.id, "tournament");
				
			        if (check === true) {
			            btn.textContent = t.requests_send;
			            btn.disabled = true;
			            btn.style.backgroundColor = "#00ff08ff";
			        } else {
			            btn.textContent = t.error;
			            btn.disabled = false;
			            // Réinitialiser après 2 secondes
			            setTimeout(() => {
			                btn.textContent = t.invite;
			                btn.disabled = false;
			            }, 2000);
			        }
			    } catch (error) {
			        console.error("Invitation error:", error);
			        btn.textContent = t.error;
			        btn.disabled = false;
			        // Réinitialiser après 2 secondes
			        setTimeout(() => {
			            btn.textContent = t.invite;
			            btn.disabled = false;
			        }, 2000);
			    }
			});
			li.appendChild(btn);
			lstFriends.appendChild(li);
		});

		})();

    	const actionsCol = document.createElement("div");
    	actionsCol.className = "w-9/10 p-3 flex flex-col items-center justify-center gap-3 glass-blur";

    	const startBtn = document.createElement("button");
		startBtn.textContent = t.host;
    	startBtn.className = "border-1 border-white/30 bg-green-500/80 w-full rounded-2xl text-3xl px-10 tracking-wide py-1.5 duration-300 transition-all hover:scale-105 hover:bg-green-700";
		startBtn.onclick = () => navigateTo(`/Tournament/game?uid=${currentTournament ? currentTournament.uuid: ""}`);

    	actionsCol.appendChild(startBtn);
    	rightContainer.appendChild(actionsCol);

		mainContainer.appendChild(rightContainer);
    	mainContainer.appendChild(bracketContainer);
    	renderBracket();

    	const BackToMenuOverlay = document.createElement("div");
    	BackToMenuOverlay.className = "fixed inset-0 z-[2000] hidden bg-black/60 flex items-center justify-center p-4";

		const BackToMenuSure = document.createElement("div");
		BackToMenuSure.className = "w-[100vw] text-center gap-6 justify-center items-center rounded-xl p-8 flex flex-col";

		const BackToMenuTitle = document.createElement("h1");
		BackToMenuTitle.className = "text-5xl neon-matrix";
		BackToMenuTitle.textContent = t.title_leave;
		BackToMenuSure.appendChild(BackToMenuTitle);

		const BackToMenuTxt = document.createElement("p");
		BackToMenuTxt.className = "";
		BackToMenuTxt.textContent = t.txt_leave;
		BackToMenuSure.appendChild(BackToMenuTxt);

		const actions = document.createElement("div");
		actions.className = "flex gap-4 justify-center";

		const CancelBtn = document.createElement("button");
		CancelBtn.className = "px-4 py-2 rounded-xl border border-gray-300 hover:scale-110 transition-all duration-300";
		CancelBtn.textContent = t.cancel;
		CancelBtn.onclick = () => {
			BackToMenuOverlay.classList.add("hidden")
		};
		actions.appendChild(CancelBtn);

		const ConfirmBtn = document.createElement("button");
		ConfirmBtn.className = "px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-all duration-300";
		ConfirmBtn.textContent = t.back;
		ConfirmBtn.onclick = () => {
			//! QUIT TOURNAMENT AND DELETE TOURNAMENT
			mainContainer.classList.add("fade-out");
			setTimeout(() => {navigateTo("/Tournament/menu");}, 1000);
		};
		actions.appendChild(ConfirmBtn);

		BackToMenuSure.appendChild(actions);
		BackToMenuOverlay.appendChild(BackToMenuSure);
		// L’overlay doit être au niveau du container principal
		mainContainer.appendChild(BackToMenuOverlay);

    	const BackToMenuBtn = document.createElement("button");
		BackToMenuBtn.textContent = t.back;
    	BackToMenuBtn.className = "border-1 border-white/30 bg-green-500/80 w-full rounded-2xl text-3xl px-10 tracking-wide py-1.5 duration-300 transition-all hover:scale-105 hover:bg-green-700";
    	BackToMenuBtn.addEventListener("click", (e) => {
    	     e.preventDefault();
    	     BackToMenuOverlay.classList.remove("hidden");
    	 });
    	actionsCol.appendChild(BackToMenuBtn);

		BackToMenuOverlay.addEventListener("click", (e) => {
  			if (e.target === BackToMenuOverlay) BackToMenuOverlay.classList.add("hidden");
		});

		const onEsc = (e: KeyboardEvent) => {
  			if (e.key === "Escape") BackToMenuOverlay.classList.add("hidden");
		};
		document.addEventListener("keydown", onEsc);
	}
	initializeTournament();

    return (mainContainer);
}

export function PongTournamentPageCurrentGame(): HTMLElement {

	let currentTournament: Tournament | undefined;

    const mainContainer = document.createElement("div");
    mainContainer.className = "gap-5 z-[2000] min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

	const loadingContainer = document.createElement("div");
    loadingContainer.className = "flex items-center justify-center";
    loadingContainer.innerHTML = "<p>Chargement du tournoi...</p>";
    mainContainer.appendChild(loadingContainer);

	async function initializeTournament() {
        try {
            currentTournament = await getCurrentTournament();
            console.log("CURRENT TOURNAMENT GAME: ", currentTournament);
            
            renderTournament();
        } catch (error) {
            console.error("Erreur lors du chargement du tournoi:", error);
            loadingContainer.innerHTML = "<p>Erreur lors du chargement du tournoi</p>";
        }
    }

	function renderTournament(){
        loadingContainer.remove();

    	const Title = document.createElement("h1");
    	Title.className = "absolute top-5 tracking-widest text-6xl neon-matrix mb-15";
    	Title.textContent = currentTournament?.name + " " + t.tournament;
    	mainContainer.appendChild(Title);

		const size = currentTournament?.size ?? nb_players.value;
		const players = (currentTournament?.players && Array.isArray(currentTournament.players) && currentTournament.players.length ? currentTournament.players.map(p => p.uuid) : Array.from({ length: size }, (_, i) => `${t.player} ${i + 1}`));
		
    	const bracket = createTournamentBracket(players);
    	bracket.classList.add("mt-15", "pl-5");
    	mainContainer.appendChild(bracket);

		const BackToMenuOverlay = document.createElement("div");
		BackToMenuOverlay.className = "fixed inset-0 z-[2000] hidden bg-black/60 flex items-center justify-center p-4";

		const BackToMenuSure = document.createElement("div");
		BackToMenuSure.className = "w-[100vw] text-center gap-6 justify-center items-center rounded-xl p-8 flex flex-col";

		const BackToMenuTitle = document.createElement("h1");
		BackToMenuTitle.className = "text-5xl neon-matrix";
		BackToMenuTitle.textContent = t.title_leave;
		BackToMenuSure.appendChild(BackToMenuTitle);

		const BackToMenuTxt = document.createElement("p");
		BackToMenuTxt.className = "";
		BackToMenuTxt.textContent = t.txt_leave;
		BackToMenuSure.appendChild(BackToMenuTxt);

		const actions = document.createElement("div");
		actions.className = "flex gap-4 justify-center";

		const CancelBtn = document.createElement("button");
		CancelBtn.className = "px-4 py-2 rounded-xl border border-gray-300 hover:scale-110 transition-all duration-300";
		CancelBtn.textContent = t.cancel;
		CancelBtn.onclick = () => {
			BackToMenuOverlay.classList.add("hidden")
		};
		actions.appendChild(CancelBtn);

		const ConfirmBtn = document.createElement("button");
		ConfirmBtn.className = "px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-all duration-300";
		ConfirmBtn.textContent = t.back;
		ConfirmBtn.onclick = () => {
			//! QUIT TOURNAMENT
			mainContainer.classList.add("fade-out");
			setTimeout(() => {navigateTo("/Tournament/menu");}, 1000);
		};
		actions.appendChild(ConfirmBtn);

		BackToMenuSure.appendChild(actions);
		BackToMenuOverlay.appendChild(BackToMenuSure);
		mainContainer.appendChild(BackToMenuOverlay);

		const BackToMenuBtn = CreateWrappedButton(mainContainer, t.back, "null", 1);
		BackToMenuBtn.className = "absolute bottom-2 right-2";
		BackToMenuBtn.addEventListener("click", (e) => {
			e.preventDefault();
			BackToMenuOverlay.classList.remove("hidden");
		})
    	mainContainer.appendChild(BackToMenuBtn);

		BackToMenuOverlay.addEventListener("click", (e) => {
  			if (e.target === BackToMenuOverlay) BackToMenuOverlay.classList.add("hidden");
		});

		const onEsc = (e: KeyboardEvent) => {
  			if (e.key === "Escape") BackToMenuOverlay.classList.add("hidden");
		};
		document.addEventListener("keydown", onEsc);
	}
	initializeTournament();

    return (mainContainer);
}
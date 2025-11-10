import { t } from "./settings";
import { CreateWrappedButton, CreateSlider, Invitation, getUidInventory } from "../components/utils";
import { createInputWithEye, togglePassword } from "./register"; 
import { navigateTo } from "../routes";
import { createTournamentBracket } from "../components/bracket";
import { getUser } from "../linkUser";
import { GetData } from "./user";
import type { Friend } from "./friends";

let nb_players = {value: 16};

const refreshIntervals: Set<number> = new Set();

export function cleanupAllIntervals() {
    refreshIntervals.forEach(interval => {
        window.clearInterval(interval);
    });
    refreshIntervals.clear();
}

function setupManagedInterval(callback: () => void, delay: number): number {
    const interval = window.setInterval(callback, delay);
    refreshIntervals.add(interval);
    return interval;
}

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
	launch: number,
}

export let tournamentList: Tournament[] = [];

//? -------- UTILS -------- ?//

async function refreshTournamentData(tournamentUUID?: string): Promise<boolean> {
    try {
        const previousList = [...tournamentList];
        await GetTournamentList();
        
        const hasChanged = JSON.stringify(previousList) !== JSON.stringify(tournamentList);
        
        if (tournamentUUID) {
            const currentTournament = tournamentList.find(t => t.uuid === tournamentUUID);
            if (currentTournament) {
                window.dispatchEvent(new CustomEvent('tournamentUpdated', {
                    detail: { tournament: currentTournament, hasChanged }
                }));
            }
        }
        
        return hasChanged;
    } catch (error) {
        console.error("Error refreshing tournament data:", error);
        return false;
    }
}

export async function getDataUuidTournament(uuid: string){
	const jwt = localStorage.getItem("jwt");
    try {
        const resp = await fetch(`/tournament/tournament/${encodeURIComponent(uuid)}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwt}`,
				"Content-Type": "application/json",
            },
        });
        
        if (!resp.ok) {
            console.error("Error fetching tournaments:", resp.status, resp.statusText);
            return null;
        }
		const data: Tournament = await resp.json();
		// console.log("GET DATA TOURNAMENT: ", data);
		return (data);
    } catch (error) {
        console.error("Error network :", error);
    }
}

async function GetTournamentList() {
    const jwt = localStorage.getItem("jwt");
	if (!jwt) {
        console.error("No JWT token found");
        return null;
    }
    try {
        const resp = await fetch("/tournament/tournament", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Accept": "application/json",
				"Content-Type": "application/json",
            },
        });
     
        if (!resp.ok) {
            console.error("Error fetching tournaments:", resp.status, resp.statusText);
            return null;
        }

        const data: Tournament[] = await resp.json();
        tournamentList = data;
        // console.log("Tournament list updated:", tournamentList);
        return data;
        
    } catch (error) {
        console.error("Error network :", error);
		return null;
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

export async function getCurrentTournament(): Promise<Tournament | undefined> {
    try {
        const updatedList = await GetTournamentList();
        const uuid = getUuid();
        console.log("UUID :", uuid);
        console.log("TOURNAMENTLIST :", updatedList);
        
        if (!uuid) {
            console.error("No UUID found in URL");
            return undefined;
        }
        
        const tournament = tournamentList.find(t => t.uuid === uuid);
        if (!tournament) {
            console.warn("Tournament not found with UUID:", uuid);
            const directData = await getDataUuidTournament(uuid);
            if (directData) {
                tournamentList.push(directData);
                return directData;
            }
        }
        
        console.log("TOURNAMENT FIND: ", tournament);
        return tournament;
    } catch (error) {
        console.error("Error in getCurrentTournament:", error);
        return undefined;
    }
}

export async function getPlayerNames(uuids: string[]): Promise<string[]> {
    try {
        const names = await Promise.all(
            uuids.map(async (uuid) => {
                try {
                    const userData = await GetData(uuid);
                    // Privilégier username_tournament pour les tournois
                    return userData?.username_tournament || userData?.username || `Player ${uuid.slice(0, 8)}`;
                } catch (error) {
                    console.error(`Error fetching user ${uuid}:`, error);
                    return `Player ${uuid.slice(0, 8)}`;
                }
            })
        );
        return names;
    } catch (error) {
        console.error("Error in getPlayerNames:", error);
        // Fallback: return UUID if error
        return uuids.map(uuid => `Player ${uuid.slice(0, 8)}`);
    }
}

function setupBracketAutoRefresh(tournamentUUID: string, bracketContainer: HTMLElement, interval: number = 60000) {
    const refreshInterval = setupManagedInterval(async () => {
        try {
            const hasChanged = await refreshTournamentData(tournamentUUID);
            if (hasChanged) {
                const updatedTournament = tournamentList.find(t => t.uuid === tournamentUUID);
                if (updatedTournament) {
                    await updateBracketDisplay(updatedTournament, bracketContainer);
                }
            }
        } catch (error) {
            console.error("Error refreshing bracket:", error);
        }
    }, interval);

    return refreshInterval;
}

export async function updateBracketDisplay(tournament: Tournament, bracketContainer: HTMLElement) {
    bracketContainer.innerHTML = "";
    const newBracket = await createTournamentBracket(tournament);
    newBracket.classList.add("mt-15", "pl-5");
    bracketContainer.appendChild(newBracket);
}

export function parsePlayer(tournament: Tournament): Players[] {
    const playersData = tournament?.players;
    let playerArray: Players[] = [];

    try {
        if (typeof playersData === 'string') {
            playerArray = JSON.parse(playersData);
        } else if (Array.isArray(playersData)) {
            playerArray = playersData;
        }
    } catch (error) {
        console.error("Error parsing players:", error);
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


async function launchTournament(uuid: string): Promise<boolean>{
	const jwt = localStorage.getItem("jwt");
	if (!jwt)
		return false;
	try {
		const resp = await fetch(`/tournament/tournament/launch/${encodeURIComponent(uuid)}`, {
			method: 'PATCH',
    		headers: {
				"Authorization": `Bearer ${jwt}`,
    		},
		});
		if (resp.ok) {
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

//? ------ PAGE ------ ?//

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
					stopRefresh();
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
			if ((!tournament.password || PasswordInputJoin.value === tournament.password ) && tournament.launch == 0) {
				mainContainer.classList.add("fade-out");
				stopRefresh();
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

	let refreshInterval: number | null = null;

	function startRefresh() {
	    stopRefresh();
	    refreshInterval = setupManagedInterval(async () => {
	        console.log("Refreshing tournament list...");
	        await refreshTournamentData();
	        renderJoinList();
	    }, 5000);
	}

	function stopRefresh() {
	    if (refreshInterval) {
	        window.clearInterval(refreshInterval);
	        refreshIntervals.delete(refreshInterval);
	        refreshInterval = null;
	    }
	}

	mainContainer.addEventListener('DOMNodeRemoved', () => {
	    stopRefresh();
	});

	GetTournamentList().then(() => {
	    console.log("TOURNAMENTLIST LIST: ", tournamentList); 
	    renderJoinList();
	    startRefresh();
	});
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
            	// console.log("TOURNAMENT PLAYER: ", playerCount);
            	tnb.textContent = `${playerCount.length}/${tournament.size}`;
            	li.appendChild(tnb);

				const tvis = document.createElement("p");
				tvis.className = "w-1/3";
				tvis.textContent = tournament.visibility === 1 ? t.private: t.public;
				li.appendChild(tvis);
    		};
    		renderLabel();

			if (tournament.size > parsePlayer(tournament).length)
			{
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
						stopRefresh();
						if (tournament.host === getUser()?.uuid)
							setTimeout(() => navigateTo(`/Tournament/host?uid=${tournament.uuid}`), 1000);
						else
            	        	setTimeout(() => navigateTo(`/Tournament/join?uid=${tournament.uuid}`), 1000);
            	    }
      				setTimeout(renderLabel, 1000);
    			});
			}
			if (tournament.launch == 0)
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

    async function checkAndRedirectIfLaunched() {
        if (!currentTournament?.uuid) return;
        
        try {
            const freshTournament = await getDataUuidTournament(currentTournament.uuid);
            if (freshTournament && freshTournament.launch) {
                console.log("Tournament launched, redirecting to game...", window.location.href);
                stopRefresh();
				navigateTo(`/Tournament/bracket?uid=${currentTournament.uuid}`);
                return true;
            }
        } catch (error) {
            console.error("Error checking tournament launch status:", error);
        }
        return false;
    }

    async function initializeTournament() {
        try {
			await refreshTournamentData();
            currentTournament = await getCurrentTournament();
            console.log("CURRENT : ", currentTournament);

			if (currentTournament){

				const isLaunched = await checkAndRedirectIfLaunched();
                if (isLaunched) {
					// navigateTo(`/Tournament/bracket?uid=${currentTournament.uuid}`);
                    return;
                }

				const inv = await getUidInventory(currentTournament?.host || "err");
				if (inv) hostname = inv.username;

				mainContainer.innerHTML = "";
                await renderTournament();
			} else {
                loadingContainer.innerHTML = `<p>${t.error}</p>`;
            }
			
        } catch (error) {
            console.error("Error loading tournament:", error);
            loadingContainer.innerHTML = `<p>${t.error}</p>`;
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
		
		if (currentTournament)
		{
		    const bracketContainer = document.createElement("div");
		    bracketContainer.id = "bracket-container";
		    bracketContainer.classList.add("mt-15", "pl-5");
		    mainContainer.appendChild(bracketContainer);
		
		    await updateBracketDisplay(currentTournament, bracketContainer);
		
		    refreshInterval = setupBracketAutoRefresh(currentTournament.uuid, bracketContainer);
		}

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
			mainContainer.classList.add("fade-out");
			stopRefresh();
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

    function startRefresh() {
        stopRefresh();
        refreshInterval = setupManagedInterval(async () => {
            console.log("Refreshing join tournament data...");
            
            const shouldRedirect = await checkAndRedirectIfLaunched();
            if (shouldRedirect) {
                return;
            }
            
            await refreshTournamentData(currentTournament?.uuid);
            if (currentTournament) {
                const bracketContainer = document.getElementById("bracket-container");
                if (bracketContainer) {
                    await updateBracketDisplay(currentTournament, bracketContainer);
                }
            }
        }, 5000);
    }

    function stopRefresh() {
        if (refreshInterval) {
            window.clearInterval(refreshInterval);
            refreshIntervals.delete(refreshInterval);
            refreshInterval = null;
        }
    }

    mainContainer.addEventListener('DOMNodeRemoved', () => {
        stopRefresh();
    });

	initializeTournament();
	startRefresh();


    return (mainContainer);
}

export function PongTournamentPageHost(): HTMLElement {

	let currentTournament: Tournament | undefined;
	let refreshInterval: number | null = null;

    const mainContainer = document.createElement("div");
    mainContainer.className = "gap-5 z-[2000] min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

	const loadingContainer = document.createElement("div");
    loadingContainer.className = "flex items-center justify-center";
    loadingContainer.innerHTML = `<p>${t.login} ${t.tournament}...</p>`;
    mainContainer.appendChild(loadingContainer);

	async function initializeTournament() {
        try {
			await refreshTournamentData();
            currentTournament = await getCurrentTournament();
            console.log("CURRENT TOURNAMENT HOST: ", currentTournament);
            
            if (currentTournament) {
				if (currentTournament.launch)
				{
					navigateTo(`/Tournament/bracket?uid=${currentTournament.uuid}`);
					stopRefresh();
					return;
				}
				else
				{
					mainContainer.innerHTML = "";
                	await renderTournament();
				}
            } else {
                loadingContainer.innerHTML = `<p>${t.error}</p>`;
            }
        } catch (error) {
            console.error("Error loading tournament:", error);
            loadingContainer.innerHTML = `<p>${t.error}</p>`;
        }
    }

	async function renderTournament() {
    	loadingContainer.remove();

    	const Title = document.createElement("h1");
    	Title.className = "absolute top-5 tracking-widest text-6xl neon-matrix mb-15";
    	Title.textContent = currentTournament?.name + " " + t.tournament;
    	mainContainer.appendChild(Title);
	
		if (currentTournament)
		{
		    const bracketContainer = document.createElement("div");
		    bracketContainer.id = "bracket-container";
		    bracketContainer.className = "mt-15 pl-5 w-full";
		    mainContainer.appendChild(bracketContainer);
		
		    await updateBracketDisplay(currentTournament, bracketContainer);
		}

		if (currentTournament) {
            refreshInterval = setupManagedInterval(async () => {
                console.log("Refreshing host tournament data...");
                const hasChanged = await refreshTournamentData(currentTournament?.uuid);
                if (hasChanged) {
                    const updatedTournament = tournamentList.find(t => t.uuid === currentTournament?.uuid);
                    if (updatedTournament) {
                        currentTournament = updatedTournament;
                        const bracketContainer = mainContainer.querySelector('.mt-15.pl-5') as HTMLElement;
                        if (bracketContainer) {
                            await updateBracketDisplay(currentTournament, bracketContainer);
                        }
                        if (currentTournament.launch) {
                            stopRefresh();
                            navigateTo(`/Tournament/bracket?uid=${currentTournament.uuid}`);
                        }
                    }
                }
            }, 5000);
        }

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
		startBtn.onclick = async () => {
			if (currentTournament)
			{
				const ret = await launchTournament(currentTournament.uuid)
				if (ret && currentTournament.size === parsePlayer(currentTournament).length)
				{
					stopRefresh();
					navigateTo(`/Tournament/bracket?uid=${currentTournament.uuid}`);
				}
				else
				{
					const old = startBtn.textContent;
					startBtn.textContent = t.error;
					setTimeout(() => {startBtn.textContent = old;}, 300);
				}
			}
		};

    	actionsCol.appendChild(startBtn);
    	rightContainer.appendChild(actionsCol);

		mainContainer.appendChild(rightContainer);

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
			stopRefresh();
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

	function startRefresh() {
	    stopRefresh();
	    refreshInterval = setupManagedInterval(async () => {
	        await refreshTournamentData(currentTournament?.uuid);
	        await initializeTournament();
	    }, 5000);
	}

	function stopRefresh() {
	    if (refreshInterval) {
	        window.clearInterval(refreshInterval);
	        refreshIntervals.delete(refreshInterval);
	        refreshInterval = null;
	    }
	}

	mainContainer.addEventListener('DOMNodeRemoved', () => {
	    stopRefresh();
	});

	initializeTournament();
	startRefresh();

    return (mainContainer);
}

export function PongTournamentPageCurrentGame(): HTMLElement {
    let currentTournament: Tournament | undefined;
    let refreshInterval: number | null = null;
    let myNextMatch: any = null;
    let tournamentStatus: any = null;
    const myUuid = getUser()?.uuid;

    const mainContainer = document.createElement("div");
    mainContainer.className = "gap-5 z-[2000] min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

    const loadingContainer = document.createElement("div");
    loadingContainer.className = "flex items-center justify-center";
    loadingContainer.innerHTML = `<p>${t.login} ${t.tournament}...</p>`;
    mainContainer.appendChild(loadingContainer);

    async function initializeTournament() {
        try {
            await refreshTournamentData();
            currentTournament = await getCurrentTournament();
            console.log("CURRENT TOURNAMENT GAME: ", currentTournament);
            
            if (currentTournament?.uuid) {
                sessionStorage.setItem('currentTournamentUuid', currentTournament.uuid);
            }
            
            if (currentTournament) {
                await fetchTournamentStatus();
                await fetchMyNextMatch();
                await renderTournament();
            } else {
                loadingContainer.innerHTML = `<p>${t.error}</p>`;
            }
        } catch (error) {
            console.error("Error loading tournament:", error);
            loadingContainer.innerHTML = `<p>${t.error}</p>`;
        }
    }

    async function fetchTournamentStatus() {
        if (!currentTournament) return;
        
        const token = localStorage.getItem("jwt") || "";
        try {
            const resp = await fetch(`/tournament/tournament/${currentTournament.uuid}/status`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (resp.ok) {
                tournamentStatus = await resp.json();
                console.log("Tournament status:", tournamentStatus);
            }
        } catch (error) {
            console.error("Error fetching status:", error);
        }
    }

    async function fetchMyNextMatch() {
        if (!currentTournament || !myUuid) return;
        
        const token = localStorage.getItem("jwt") || "";

        try {
            const resp = await fetch(`/tournament/tournament/${currentTournament.uuid}/next-match/${myUuid}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (resp.ok) {
                const data = await resp.json();
                myNextMatch = data.match;
                console.log("My next match:", myNextMatch);
            }
        } catch (error) {
            console.error("Error fetching next match:", error);
        }
    }

    async function renderTournament() {
        loadingContainer.remove();
        mainContainer.innerHTML = "";

        // Title
        const Title = document.createElement("h1");
        Title.className = "absolute top-5 tracking-widest text-6xl neon-matrix mb-15";
        Title.textContent = currentTournament?.name + " " + t.tournament;
        mainContainer.appendChild(Title);

        const contentContainer = document.createElement("div");
        contentContainer.className = "w-full max-w-7xl px-4 flex flex-col gap-6 mt-20";

        // 🏆 Winner Banner (si le tournoi est terminé)
        if (tournamentStatus?.tournament?.winner) {
            const winnerBanner = document.createElement("div");
            winnerBanner.className = "w-full p-6 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-xl text-center shadow-xl";
            
            const winnerText = document.createElement("h2");
            winnerText.className = "text-4xl font-bold text-black";
            winnerText.textContent = `🏆 ${t.winner}: ${(await GetData(tournamentStatus.tournament.winner)).username_tournament}`;
            winnerBanner.appendChild(winnerText);
            
            contentContainer.appendChild(winnerBanner);
        }

        if (myNextMatch) {
            const myMatchSection = document.createElement("div");
            myMatchSection.className = "w-full p-6 glass-blur rounded-xl border-2 border-green-500";

            const header = document.createElement("h2");
            header.className = "text-3xl neon-matrix mb-4";
            header.textContent = "🎮 " + t.your_match;
            myMatchSection.appendChild(header);

            const matchCard = document.createElement("div");
            matchCard.className = "bg-black/40 p-6 rounded-xl flex flex-col gap-4";

            // Round info
            // const roundInfo = document.createElement("p");
            // roundInfo.className = "text-xl text-green-400";
            // roundInfo.textContent = `Round ${myNextMatch.round || 1}`;
            // matchCard.appendChild(roundInfo);

            // Players info
            const playersInfo = document.createElement("div");
            playersInfo.className = "text-lg text-gray-300";
            
            const player1Name = myNextMatch.player1 || t.username1;
            const player2Name = myNextMatch.player2 || t.username2;
            
            playersInfo.innerHTML = `
                <p class="font-bold text-2xl">${player1Name} <span class="text-green-400">${t.vs}</span> ${player2Name}</p>
            `;
            matchCard.appendChild(playersInfo);

            // Status
            const statusText = document.createElement("p");
            statusText.className = "text-lg font-semibold";
            
            if (myNextMatch.status === 'ready') {
                statusText.className += " text-green-400";
                statusText.textContent = `✅ ${t.game_ready} ${t.you_can_play_now}.`;
                
                // Play button (seulement si ready et que le game_uuid existe)
                if (myNextMatch.game_uuid) {
                    const playBtn = document.createElement("button");
                    playBtn.className = "w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl text-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg animate-pulse";
                    playBtn.textContent = "▶️ " + t.play;
                    playBtn.onclick = () => {
                        console.log("🎮 Starting game, stopping refresh...");
                        stopRefresh(); // Arrêter le refresh avant de naviguer
                        cleanupAllIntervals(); // Nettoyer TOUS les intervals
                        
                        // Stocker l'UUID du tournoi pour la redirection après la game
                        if (currentTournament?.uuid) {
                            sessionStorage.setItem('currentTournamentUuid', currentTournament.uuid);
                        }
                        
                        setTimeout(() => {
                            navigateTo(`/pong/online/game?uid=${myNextMatch.game_uuid}`);
                        }, 100);
                    };
                    matchCard.appendChild(playBtn);
                }
            } else if (myNextMatch.status === 'waiting') {
                statusText.className += " text-yellow-400";
                statusText.textContent = `⏳ ${t.waiting_previous_match}`;
            } else if (myNextMatch.status === 'playing') {
                statusText.className += " text-blue-400";
                statusText.textContent = `🎮 ${t.match_in_progress}!`;
                
                // Play button pour rejoindre le match en cours
                if (myNextMatch.game_uuid) {
                    const joinBtn = document.createElement("button");
                    joinBtn.className = "w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg";
                    joinBtn.textContent = `🔗 ${t.join_match}`;
                    joinBtn.onclick = () => {
                        console.log("🎮 Joining game, stopping refresh...");
                        stopRefresh(); // Arrêter le refresh avant de naviguer
                        cleanupAllIntervals(); // Nettoyer TOUS les intervals
                        
                        // Stocker l'UUID du tournoi pour la redirection après la game
                        if (currentTournament?.uuid) {
                            sessionStorage.setItem('currentTournamentUuid', currentTournament.uuid);
                        }
                        
                        setTimeout(() => {
                            navigateTo(`/pong/online/game?uid=${myNextMatch.game_uuid}`);
                        }, 100);
                    };
                    matchCard.appendChild(joinBtn);
                }
            }
            
            matchCard.appendChild(statusText);
            myMatchSection.appendChild(matchCard);
            contentContainer.appendChild(myMatchSection);
        } else if (!tournamentStatus?.tournament?.winner) {
            // Aucun match disponible
            const waitingSection = document.createElement("div");
            waitingSection.className = "w-full p-6 glass-blur rounded-xl border-2 border-gray-500";

            const header = document.createElement("h2");
            header.className = "text-2xl neon-matrix mb-4";
            header.textContent = `⏸️ ${t.waiting}`;
            waitingSection.appendChild(header);

            const waitingText = document.createElement("p");
            waitingText.className = "text-lg text-gray-400";
            waitingText.textContent = t.waiting_previous_match;
            waitingSection.appendChild(waitingText);

            contentContainer.appendChild(waitingSection);
        }

        if (tournamentStatus) {
            const progressSection = document.createElement("div");
            progressSection.className = "w-full p-6 glass-blur rounded-xl";

            const progressHeader = document.createElement("h2");
            progressHeader.className = "text-2xl neon-matrix mb-4";
            progressHeader.textContent = "📊 " + (t.tournament_progress || "Progression du Tournoi");
            progressSection.appendChild(progressHeader);

            // Calculate progress
            const allMatches = Object.values(tournamentStatus.rounds || {}).flat() as any[];
            const totalMatches = allMatches.length;
            const completedMatches = allMatches.filter(m => m.status === 'completed').length;
            const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

            // Progress bar
            const progressBar = document.createElement("div");
            progressBar.className = "w-full h-8 bg-black/40 rounded-full overflow-hidden mb-4";
            const progressFill = document.createElement("div");
            progressFill.className = "h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500";
            progressFill.style.width = `${progress}%`;
            progressBar.appendChild(progressFill);
            progressSection.appendChild(progressBar);

            // Stats
            const stats = document.createElement("div");
            stats.className = "flex justify-between text-lg";
            stats.innerHTML = `<span>${completedMatches}/${totalMatches} ${t.completed}</span>`;
            progressSection.appendChild(stats);

            contentContainer.appendChild(progressSection);
        }

        // 🎯 Bracket (votre système existant)
        if (currentTournament) {
            const bracketContainer = document.createElement("div");
            bracketContainer.id = "bracket-container";
            bracketContainer.className = "mt-6 pl-5 w-full glass-blur p-4 rounded-xl";
            
            const bracketTitle = document.createElement("h2");
            bracketTitle.className = "text-2xl neon-matrix mb-4";
            bracketTitle.textContent = `🏆 ${t.tournament}`;
            bracketContainer.appendChild(bracketTitle);
            
            const bracket = await createTournamentBracket(currentTournament);
            bracketContainer.appendChild(bracket);
            contentContainer.appendChild(bracketContainer);
        }

        mainContainer.appendChild(contentContainer);

        // Back button modal (votre code existant)
        const BackToMenuOverlay = document.createElement("div");
        BackToMenuOverlay.className = "fixed inset-0 z-[2000] hidden bg-black/60 flex items-center justify-center p-4";

        const BackToMenuSure = document.createElement("div");
        BackToMenuSure.className = "w-[100vw] text-center gap-6 justify-center items-center rounded-xl p-8 flex flex-col";

        const BackToMenuTitle = document.createElement("h1");
        BackToMenuTitle.className = "text-5xl neon-matrix";
        BackToMenuTitle.textContent = t.title_leave_tournament;
        BackToMenuSure.appendChild(BackToMenuTitle);

        const BackToMenuTxt = document.createElement("p");
        BackToMenuTxt.textContent = t.txt_leave_tournament;
        BackToMenuSure.appendChild(BackToMenuTxt);

        const actions = document.createElement("div");
        actions.className = "flex gap-4 justify-center";

        const CancelBtn = document.createElement("button");
        CancelBtn.className = "px-4 py-2 rounded-xl border border-gray-300 hover:scale-110 transition-all duration-300";
        CancelBtn.textContent = t.cancel;
        CancelBtn.onclick = () => BackToMenuOverlay.classList.add("hidden");
        actions.appendChild(CancelBtn);

        const ConfirmBtn = document.createElement("button");
        ConfirmBtn.className = "px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-all duration-300";
        ConfirmBtn.textContent = t.back;
        ConfirmBtn.onclick = () => {
            stopRefresh();
            sessionStorage.removeItem('currentTournamentUuid'); // Nettoyer le sessionStorage
            mainContainer.classList.add("fade-out");
            setTimeout(() => navigateTo("/Tournament/menu"), 1000);
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
        });
        mainContainer.appendChild(BackToMenuBtn);

        BackToMenuOverlay.addEventListener("click", (e) => {
            if (e.target === BackToMenuOverlay) BackToMenuOverlay.classList.add("hidden");
        });

        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") BackToMenuOverlay.classList.add("hidden");
        };
        document.addEventListener("keydown", onEsc);
    }

    function startRefresh() {
        stopRefresh();
        refreshInterval = setupManagedInterval(async () => {
            // ⚠️ NE PAS RAFRAÎCHIR si on n'est pas sur la page du tournoi
            if (window.location.pathname !== '/Tournament/bracket') {
                console.log("Not on tournament page, stopping refresh");
                stopRefresh();
                return;
            }

            console.log("Refreshing tournament game data...");
            const previousStatus = JSON.stringify(tournamentStatus);
            const previousMatch = JSON.stringify(myNextMatch);
            
            await refreshTournamentData(currentTournament?.uuid);
            await fetchTournamentStatus();
            await fetchMyNextMatch();
            
            // Re-render seulement si quelque chose a changé
            const statusChanged = previousStatus !== JSON.stringify(tournamentStatus);
            const matchChanged = previousMatch !== JSON.stringify(myNextMatch);
            
            if (statusChanged || matchChanged) {
                console.log("Changes detected, re-rendering...");
                await renderTournament();
            }
        }, 5000); // Refresh toutes les 5 secondes (augmenté pour moins de charge)
    }

    function stopRefresh() {
        if (refreshInterval) {
            window.clearInterval(refreshInterval);
            refreshIntervals.delete(refreshInterval);
            refreshInterval = null;
        }
    }

    mainContainer.addEventListener('DOMNodeRemoved', () => {
        stopRefresh();
    });

    initializeTournament();
    startRefresh();

    return mainContainer;
}

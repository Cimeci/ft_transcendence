import { getCurrentLang } from "./settings";
import { translations } from "../i18n";
import { CreateWrappedButton } from "./pong";
import { createInputWithEye, togglePassword } from "./register"; 
import { navigateTo } from "../routes";
import { createTournamentBracket } from "../components/bracket";
import { CreateSlider } from "../components/utils";
import { users } from "./friends";
import { getUser } from "../linkUser";

let nb_players = {value: 16};

export type TournamentVisibility = 'public' | 'private';
export interface Tournament {
  name: string;
  maxPlayers: number;
  activePlayers: number;
  visibility: TournamentVisibility;
  password?: string; // only in private
  players?: string[];  // liste courante des joueurs
  started?: boolean;   // état démarré
}

export const tournamentList: Tournament[] = [];
export let currentTournament: Tournament | null = null; // tournament  select  ! HAVE TO CHANGE IT BY THE BD ! //

export function PongTournamentMenuPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "pt-25 min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

	const Title = document.createElement("h1");
	Title.className = "absolute tracking-widest text-6xl neon-matrix top-25";
	Title.textContent = translations[getCurrentLang()].tournament;
	mainContainer.appendChild(Title);

	const TournamentContainer = document.createElement("div");
    TournamentContainer.className = "flex flex-col mt-20 lg:flex-row items-center justify-center gap-20 w-full px-4";

    const HostContainer = document.createElement("div");
    HostContainer.className = "flex flex-col text-center items-center justify-center border-2 rounded-xl p-10 gap-8 w-[90vw] lg:w-[40vw] h-[70vh] min-h-[20rem] overflow-hidden";

	const HostTitle = document.createElement("h2");
	HostTitle.className = "top-2 neon-matrix";
	HostTitle.textContent = translations[getCurrentLang()].host;
	HostContainer.appendChild(HostTitle);

	HostContainer.appendChild(CreateSlider(nb_players, translations[getCurrentLang()].player_number, 2, 16)); // add render function for db

	const GameName = document.createElement("input");
	GameName.className = "w-9/10 border-2 rounded-xl text-xl p-2";
	GameName.placeholder = translations[getCurrentLang()].tournament_name;
	GameName.maxLength = 20;
	HostContainer.appendChild(GameName);

	const GamePassword = document.createElement("input");
	GamePassword.className = "w-9/10 border-2 rounded-xl text-xl p-2";
	GamePassword.placeholder = translations[getCurrentLang()].password;
	GamePassword.type = "password";

    const EyePassword = document.createElement("img");
    EyePassword.className = "absolute right-12 top-1/5 cursor-pointer w-7 h-7 duration-300 transition-all hover:scale-110";
    EyePassword.src = "/icons/eye-off.svg";
    EyePassword.alt = "Show/Hide";
    EyePassword.onclick = () => togglePassword(GamePassword, EyePassword);

    // wrapper input + œil (on le toggle)
    const PasswordWrapper = createInputWithEye(GamePassword, EyePassword);
    HostContainer.appendChild(PasswordWrapper);

	const toggleBtn = document.createElement("label");
	toggleBtn.className = "inline-flex items-center cursor-pointer";

	const toggleSpan1 = document.createElement("span");
	toggleSpan1.className = "mr-3 text-xl font-large text-gray-900 dark:text-gray-300";
	toggleSpan1.textContent = "Public";
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
	toggleSpan2.textContent = "Private";
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

	const JoinContainer = document.createElement("div");
    JoinContainer.className = "flex flex-col items-center justify-center border-2 rounded-xl p-10 w-[90vw] lg:w-[40vw] h-[70vh] min-h-[20rem] overflow-hidden";

	const JoinTitle = document.createElement("h2");
	JoinTitle.className = "top-2 neon-matrix";
	JoinTitle.textContent = translations[getCurrentLang()].join;
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
		PasswordInputJoin.placeholder = translations[getCurrentLang()].password;
		PasswordInputJoin.type = "password";	

		const EyePasswordJoin = document.createElement("img");
		EyePasswordJoin.className = "absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer w-7 h-7 duration-300 transition-all hover:scale-110";
		EyePasswordJoin.src = "/icons/eye-off.svg";
		EyePasswordJoin.alt = "Show/Hide";
		EyePasswordJoin.onclick = () => togglePassword(PasswordInputJoin, EyePasswordJoin);
		JoinForm.appendChild(createInputWithEye(PasswordInputJoin, EyePasswordJoin));	

		const ConfirmJoinBtn = document.createElement("button");
		ConfirmJoinBtn.className = "h-[7vh] btn-fluid bg-green-600 text-white rounded-xl hover:scale-102 hover:bg-green-700 transition-all";
		ConfirmJoinBtn.textContent = translations[getCurrentLang()].join;
		ConfirmJoinBtn.addEventListener("click", () => {
			if (!tournament.password || PasswordInputJoin.value === tournament.password) {
				currentTournament = tournament;
				mainContainer.classList.add("fade-out");
				setTimeout(() => navigateTo("/tournament/join"), 1000);
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
	tname.textContent = translations[getCurrentLang()].name;
	titleList.appendChild(tname);
	const tnb = document.createElement("p");
	tnb.className = "w-1/3";
	tnb.textContent = translations[getCurrentLang()].nbplayer;
	titleList.appendChild(tnb);
	const tvis = document.createElement("p");
	tvis.className = "w-1/3";
	tvis.textContent = translations[getCurrentLang()].visibilty;
	titleList.appendChild(tvis);
	JoinContainer.appendChild(titleList)

	const JoinList = document.createElement("ul");
	JoinList.className = "gap-10 p-2 text-center w-full flex-1 min-h-0 overflow-y-auto border-2 rounded-xl overflow-x-hidden";
	JoinContainer.appendChild(JoinList);

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
				tnb.textContent = `${tournament.activePlayers}/${tournament.maxPlayers}`;
				li.appendChild(tnb);
				const tvis = document.createElement("p");
				tvis.className = "w-1/3";
				tvis.textContent = translations[getCurrentLang()][tournament.visibility];
				li.appendChild(tvis);
    		};
    		renderLabel();

    		li.addEventListener("click", () => {
      			JoinContainer.querySelectorAll(".join-form").forEach(el => el.remove());
				if (currentJoinForm) {
					currentJoinForm.remove();
					currentJoinForm = null;
				}
                if (tournament.visibility === "private") {
					const form = createFormJoin(tournament);
					currentJoinForm = form;
					JoinList.insertAdjacentElement("afterend", form);
					form.scrollIntoView({ behavior: "smooth", block: "nearest" });
                } else {
                    currentTournament = tournament;
                    mainContainer.classList.add("fade-out");
                    setTimeout(() => navigateTo("/tournament/join"), 1000);
                }
      			setTimeout(renderLabel, 1000);
    		});
    		JoinList.appendChild(li);
  		});
	};

	renderJoinList();


	const HostBtn = document.createElement("button");
	HostBtn.className = "h-[7vh] w-9/10 bg-green-600 text-white rounded-xl hover:bg-green-700 hover:scale-102 duration-300 transition-all";
	HostBtn.textContent = translations[getCurrentLang()].host;
    HostBtn.addEventListener("click", () => {
		if (!GameName.value)
		{
			GameName.classList.add("text-red-600", "shake");
			GameName.placeholder = translations[getCurrentLang()].empty_input;
			setTimeout(() => {GameName.placeholder = translations[getCurrentLang()].tournament_name; GameName.classList.remove("text-red-600", "shake");}, 1000)
		}
		if (!GamePassword.value)
		{
			GamePassword.classList.add("text-red-600", "shake");
			GamePassword.placeholder = translations[getCurrentLang()].empty_input;
			EyePassword.classList.add("shake");
			setTimeout(() => {
				GamePassword.placeholder = translations[getCurrentLang()].password;
				GamePassword.classList.remove("text-red-600", "shake");
				EyePassword.classList.remove("shake");
			}, 1000)
		}
		if (GameName.value)
		{
			const visibility: TournamentVisibility = toggleInput.checked ? "private" : "public";
			if (visibility === "public" || visibility === "private" && GamePassword.value)
			{
                const t: Tournament = {
                    name: GameName.value,
                    maxPlayers: nb_players.value,
                    activePlayers: 1,
                    visibility,
                    ...(visibility === "private" ? { password: GamePassword.value } : {}),
                    players: Array.from({ length: nb_players.value }, (_, i) =>
                        `${translations[getCurrentLang()].player} ${i + 1}`
                    ),
                    started: false,
                };
                tournamentList.unshift(t);
                currentTournament = t;
                renderJoinList();

                GameName.value = "";
                GamePassword.value = "";
                PasswordWrapper.classList.toggle("hidden", !toggleInput.checked);
                mainContainer.classList.add("fade-out");
                setTimeout(() => { navigateTo("/tournament/host"); }, 1000);
            }
        }
    });
    HostContainer.appendChild(HostBtn);
	
	TournamentContainer.appendChild(HostContainer); 
	TournamentContainer.appendChild(JoinContainer);
	mainContainer.appendChild(TournamentContainer);

	return (mainContainer);
}

export function PongTournamentPageJoin(): HTMLElement {

    const mainContainer = document.createElement("div");
    mainContainer.className = "gap-5 z-[2000] min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

    const Title = document.createElement("h1");
    Title.className = "absolute top-5 tracking-widest text-6xl neon-matrix mb-15";
    Title.textContent = currentTournament?.name + " " + translations[getCurrentLang()].tournament;
    mainContainer.appendChild(Title);

    const size = currentTournament?.maxPlayers ?? nb_players.value;
    const players = (currentTournament?.players?.length
        ? currentTournament.players.slice()
        : Array.from({ length: size }, (_, i) => `${translations[getCurrentLang()].player} ${i + 1}`));
	

    const bracket = createTournamentBracket(players);
    bracket.classList.add("mt-15", "pl-5");
    mainContainer.appendChild(bracket);

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

	users.forEach(e => {
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
		btn.textContent = "Invite"; //! trad
		btn.addEventListener("click", () => {
			window.showInvite({
                username: getUser()?.username || "default",
                id: "2311",
                avatar: "/avatar/inowak--.jpg",
                message: "Invitation to play " + (currentTournament?.name || "tournament"),
            });
		});
		li.appendChild(btn);
		lstFriends.appendChild(li);
	});


	const BackToMenuOverlay = document.createElement("div");
	BackToMenuOverlay.className = "fixed inset-0 z-[2000] hidden bg-black/60 flex items-center justify-center p-4";

	const BackToMenuSure = document.createElement("div");
	BackToMenuSure.className = "w-[100vw] text-center gap-6 justify-center items-center rounded-xl p-8 flex flex-col";

	const BackToMenuTitle = document.createElement("h1");
	BackToMenuTitle.className = "text-5xl neon-matrix";
	BackToMenuTitle.textContent = translations[getCurrentLang()].title_leave;
	BackToMenuSure.appendChild(BackToMenuTitle);

	const BackToMenuTxt = document.createElement("p");
	BackToMenuTxt.className = "";
	BackToMenuTxt.textContent = translations[getCurrentLang()].txt_leave;
	BackToMenuSure.appendChild(BackToMenuTxt);

	const actions = document.createElement("div");
	actions.className = "flex gap-4 justify-center";

	const CancelBtn = document.createElement("button");
	CancelBtn.className = "px-4 py-2 rounded-xl border border-gray-300 hover:scale-110 transition-all duration-300";
	CancelBtn.textContent = translations[getCurrentLang()].cancel;
	CancelBtn.onclick = () => {
		BackToMenuOverlay.classList.add("hidden")
	};
	actions.appendChild(CancelBtn);

	const ConfirmBtn = document.createElement("button");
	ConfirmBtn.className = "px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-all duration-300";
	ConfirmBtn.textContent = translations[getCurrentLang()].back;
	ConfirmBtn.onclick = () => {
		mainContainer.classList.add("fade-out");
		setTimeout(() => {navigateTo("/tournament/menu");}, 1000);
	};
	actions.appendChild(ConfirmBtn);

	BackToMenuSure.appendChild(actions);
	BackToMenuOverlay.appendChild(BackToMenuSure);
	mainContainer.appendChild(BackToMenuOverlay);

	const BackToMenuBtn = CreateWrappedButton(mainContainer, translations[getCurrentLang()].back, "null", 1);
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

    return (mainContainer);
}

export function PongTournamentPageHost(): HTMLElement {

    const mainContainer = document.createElement("div");
    mainContainer.className = "gap-5 z-[2000] min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

    const Title = document.createElement("h1");
    Title.className = "mt-15 md:mt-10 tracking-widest lg:text-6xl md:text-4xl text-2xl neon-matrix";
    Title.textContent = currentTournament?.name + " " + translations[getCurrentLang()].tournament;
    mainContainer.appendChild(Title);

    const size = currentTournament?.maxPlayers ?? nb_players.value;
    const players = (currentTournament?.players?.length
        ? currentTournament.players
        : Array.from({ length: size }, (_, i) => `${translations[getCurrentLang()].player} ${i + 1}`));
    const bracketContainer = document.createElement("div");
    bracketContainer.className = "mt-15 pl-5 w-full";
    const renderBracket = () => {
        bracketContainer.innerHTML = "";
        const b = createTournamentBracket(players);
        b.classList.add("mt-0", "pl-0");
        bracketContainer.appendChild(b);
    };

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

	users.forEach(e => {
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
		btn.textContent = "Invite"; //! trad
		btn.addEventListener("click", () => {
			window.showInvite({
                username: getUser()?.username || "default",
                id: "2311",
                avatar: "/avatar/inowak--.jpg",
                message: "Invitation to play " + (currentTournament?.name || "tournament"),
            });
		});
		li.appendChild(btn);
		lstFriends.appendChild(li);
	});

    const actionsCol = document.createElement("div");
    actionsCol.className = "w-9/10 p-3 flex flex-col items-center justify-center gap-3 glass-blur";

    const startBtn = document.createElement("button");
	startBtn.textContent = translations[getCurrentLang()].host;
    startBtn.className = "border-1 border-white/30 bg-green-500/80 w-full rounded-2xl text-3xl px-10 tracking-wide py-1.5 duration-300 transition-all hover:scale-105 hover:bg-green-700";
	startBtn.onclick = () => navigateTo("/tournament/game");

    const shuffleBtn = document.createElement("button");
	shuffleBtn.textContent = translations[getCurrentLang()].shuffle;
    shuffleBtn.className = "border-1 border-white/30 bg-green-500/80 w-full rounded-2xl text-3xl px-10 tracking-wide py-1.5 duration-300 transition-all hover:scale-105 hover:bg-green-700";
    shuffleBtn.onclick = () => {
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }
        if (currentTournament) currentTournament.players = players.slice();
        renderBracket();
    };

    actionsCol.appendChild(startBtn);
    actionsCol.appendChild(shuffleBtn);
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
	BackToMenuTitle.textContent = translations[getCurrentLang()].title_leave;
	BackToMenuSure.appendChild(BackToMenuTitle);

	const BackToMenuTxt = document.createElement("p");
	BackToMenuTxt.className = "";
	BackToMenuTxt.textContent = translations[getCurrentLang()].txt_leave;
	BackToMenuSure.appendChild(BackToMenuTxt);

	const actions = document.createElement("div");
	actions.className = "flex gap-4 justify-center";

	const CancelBtn = document.createElement("button");
	CancelBtn.className = "px-4 py-2 rounded-xl border border-gray-300 hover:scale-110 transition-all duration-300";
	CancelBtn.textContent = translations[getCurrentLang()].cancel;
	CancelBtn.onclick = () => {
		BackToMenuOverlay.classList.add("hidden")
	};
	actions.appendChild(CancelBtn);

	const ConfirmBtn = document.createElement("button");
	ConfirmBtn.className = "px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-all duration-300";
	ConfirmBtn.textContent = translations[getCurrentLang()].back;
	ConfirmBtn.onclick = () => {
		mainContainer.classList.add("fade-out");
		setTimeout(() => {navigateTo("/tournament/menu");}, 1000);
	};
	actions.appendChild(ConfirmBtn);

	BackToMenuSure.appendChild(actions);
	BackToMenuOverlay.appendChild(BackToMenuSure);
	// L’overlay doit être au niveau du container principal
	mainContainer.appendChild(BackToMenuOverlay);

    const BackToMenuBtn = document.createElement("button");
	BackToMenuBtn.textContent = translations[getCurrentLang()].back;
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

    return (mainContainer);
}

export function PongTournamentPageCurrentGame(): HTMLElement {

    const mainContainer = document.createElement("div");
    mainContainer.className = "gap-5 z-[2000] min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

	const game = document.createElement("h1");
	game.textContent = "current game";
	game.className = "absolute left-0 top-0"
	mainContainer.appendChild(game);

    const Title = document.createElement("h1");
    Title.className = "absolute top-5 tracking-widest text-6xl neon-matrix mb-15";
    Title.textContent = currentTournament?.name + " " + translations[getCurrentLang()].tournament;
    mainContainer.appendChild(Title);

    const size = currentTournament?.maxPlayers ?? nb_players.value;
    const players = (currentTournament?.players?.length
        ? currentTournament.players.slice()
        : Array.from({ length: size }, (_, i) => `${translations[getCurrentLang()].player} ${i + 1}`));
	

    const bracket = createTournamentBracket(players);
    bracket.classList.add("mt-15", "pl-5");
    mainContainer.appendChild(bracket);

	const BackToMenuOverlay = document.createElement("div");
	BackToMenuOverlay.className = "fixed inset-0 z-[2000] hidden bg-black/60 flex items-center justify-center p-4";

	const BackToMenuSure = document.createElement("div");
	BackToMenuSure.className = "w-[100vw] text-center gap-6 justify-center items-center rounded-xl p-8 flex flex-col";

	const BackToMenuTitle = document.createElement("h1");
	BackToMenuTitle.className = "text-5xl neon-matrix";
	BackToMenuTitle.textContent = translations[getCurrentLang()].title_leave;
	BackToMenuSure.appendChild(BackToMenuTitle);

	const BackToMenuTxt = document.createElement("p");
	BackToMenuTxt.className = "";
	BackToMenuTxt.textContent = translations[getCurrentLang()].txt_leave;
	BackToMenuSure.appendChild(BackToMenuTxt);

	const actions = document.createElement("div");
	actions.className = "flex gap-4 justify-center";

	const CancelBtn = document.createElement("button");
	CancelBtn.className = "px-4 py-2 rounded-xl border border-gray-300 hover:scale-110 transition-all duration-300";
	CancelBtn.textContent = translations[getCurrentLang()].cancel;
	CancelBtn.onclick = () => {
		BackToMenuOverlay.classList.add("hidden")
	};
	actions.appendChild(CancelBtn);

	const ConfirmBtn = document.createElement("button");
	ConfirmBtn.className = "px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-all duration-300";
	ConfirmBtn.textContent = translations[getCurrentLang()].back;
	ConfirmBtn.onclick = () => {
		mainContainer.classList.add("fade-out");
		setTimeout(() => {navigateTo("/tournament/menu");}, 1000);
	};
	actions.appendChild(ConfirmBtn);

	BackToMenuSure.appendChild(actions);
	BackToMenuOverlay.appendChild(BackToMenuSure);
	mainContainer.appendChild(BackToMenuOverlay);

	const BackToMenuBtn = CreateWrappedButton(mainContainer, translations[getCurrentLang()].back, "null", 1);
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

    return (mainContainer);
}
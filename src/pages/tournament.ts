import { getCurrentLang } from "./settings";
import { translations } from "../i18n";
import { CreateWrappedButton } from "./pong";
import { createInputWithEye, togglePassword } from "./register"; 
import { navigateTo } from "../routes";

let nb_players = {value: 2};

export function CreateSlider(ref: { value: number }, txt: string, minValue: number, maxValue: number, onChange?: (v: number) => void) : HTMLElement
{
	const SliderContainer = document.createElement("div");
	SliderContainer.className = "bg-slate-200 rounded-lg shadow-lg p-6 w-full max-w-lg";

	const TopSlider = document.createElement("div");
	TopSlider.className = `justify-center items-center text-center mb-4`;

	const labelSlider = document.createElement("label");
	labelSlider.textContent = txt;
	labelSlider.className = "tracking-widest block text-gray-700 font-bold mb-2"
	TopSlider.appendChild(labelSlider);

	const Slider = document.createElement("div");
	Slider.className = "flex justify-between text-gray-700";

	const min = document.createElement("span");
	min.textContent = String(minValue);

	const max = document.createElement("span");
	max.textContent = String(maxValue);

	const InputSlider = document.createElement("input");
	InputSlider.type = "range";
	InputSlider.className = "rounded-range w-full";
	if (ref.value > 0)
		InputSlider.className += " pl-2"; // espace pour éviter la concat invalide
	InputSlider.min = String(minValue);
	InputSlider.max = String(maxValue);
	InputSlider.value = String(ref.value);
	InputSlider.oninput = (event) => {
		const v = Number((event.target as HTMLInputElement).value);
		ref.value = v;
		min.textContent = String(v);
		onChange?.(v);
	};
	TopSlider.appendChild(InputSlider);

	SliderContainer.appendChild(TopSlider);
	Slider.appendChild(min);
	Slider.appendChild(max);
	SliderContainer.appendChild(Slider);

	return (SliderContainer);
}

export type TournamentVisibility = 'public' | 'private';
export interface Tournament {
  name: string;
  maxPlayers: number;
  activePlayers: number;
  visibility: TournamentVisibility;
  password?: string; // ← optionnel (public n’a pas de mot de passe)
}

export const tournamentList: Tournament[] = [];

export function PongTournamentPage(): HTMLElement {
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
    EyePassword.src = "/eye-off.svg";
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
		closeBtn.innerHTML = '<img src="/cross.svg"></img>';
		closeBtn.className = "absolute top-0 right-0 w-8 h-8 leading-7 text-center text-white/80 hover:text-white hover:scale-110 transition";
		closeBtn.addEventListener("click", () => {
			currentJoinForm = null;
			JoinForm.remove(); // !important //
		});
		JoinForm.appendChild(closeBtn);

		const PasswordInputJoin = document.createElement("input");
		PasswordInputJoin.className = "w-full border-2 rounded-xl text-xl p-2 pr-12 duration-300 transition-all focus:scale-102";
		PasswordInputJoin.placeholder = translations[getCurrentLang()].password;
		PasswordInputJoin.type = "password";	

		const EyePasswordJoin = document.createElement("img");
		EyePasswordJoin.className = "absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer w-7 h-7 duration-300 transition-all hover:scale-110";
		EyePasswordJoin.src = "/eye-off.svg";
		EyePasswordJoin.alt = "Show/Hide";
		EyePasswordJoin.onclick = () => togglePassword(PasswordInputJoin, EyePasswordJoin);
		JoinForm.appendChild(createInputWithEye(PasswordInputJoin, EyePasswordJoin));	

		const ConfirmJoinBtn = document.createElement("button");
		ConfirmJoinBtn.className = "h-[7vh] btn-fluid bg-green-600 text-white rounded-xl hover:scale-102 hover:bg-green-700 transition-all";
		ConfirmJoinBtn.textContent = translations[getCurrentLang()].join;
		ConfirmJoinBtn.addEventListener("click", () => {
		  if (!tournament.password || PasswordInputJoin.value === tournament.password) {
			mainContainer.classList.add("fade-out");
			setTimeout(() => navigateTo("/tournament"), 1000);
		  }
		  else{
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
    		li.className = "justify-around text-center items-center flex tracking-widest cursor-pointer hover:text-green-600 hover:scale-102 duration-300 transition-all";

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
                    mainContainer.classList.add("fade-out");
                    setTimeout(() => navigateTo("/tournament"), 1000);
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
  				};
				tournamentList.unshift(t);
				renderJoinList();

				GameName.value = "";
  					GamePassword.value = "";
  				PasswordWrapper.classList.toggle("hidden", !toggleInput.checked);
			}
		}
    });
    HostContainer.appendChild(HostBtn);
	
	TournamentContainer.appendChild(HostContainer); 
	TournamentContainer.appendChild(JoinContainer);
	mainContainer.appendChild(TournamentContainer);

	return (mainContainer);
}

export function PongTournamentInterfacePage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "gap-5 pt-25 min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

	const Title = document.createElement("h1");
	Title.className = "absolute top-21 tracking-widest text-6xl neon-matrix mb-15";
	Title.textContent = translations[getCurrentLang()].tournament;
	mainContainer.appendChild(Title);

	// Rangée centrée et responsive pour les boutons
	const ButtonsRow = document.createElement("div");
	ButtonsRow.className = "flex flex-wrap items-center justify-center gap-6 mt-8";

	const BackToMenuBtn = CreateWrappedButton(mainContainer, translations[getCurrentLang()].back, "/tournament/menu", 1);
	BackToMenuBtn.className = "absolute bottom-2 left-2";

	ButtonsRow.appendChild(BackToMenuBtn);
	mainContainer.appendChild(ButtonsRow);

	return (mainContainer);
}
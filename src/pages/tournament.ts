import { getCurrentLang } from "./settings";
import { translations } from "../i18n";
import { CreateWrappedButton } from "./pong";
import { createInputWithEye, togglePassword } from "./register"; 

let nb_players = {value: 2};

export function CreateSlider(ref: { value: number }, txt: string, minValue: number, maxValue: number, onChange?: (v: number) => void) : HTMLElement
{
	const SliderContainer = document.createElement("div");
	SliderContainer.className = "bg-slate-200 rounded-lg shadow-lg p-6 w-full max-w-md";

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

	const InputSlider = document. createElement("input");
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

export function PongTournamentPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "pt-25 min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

	const Title = document.createElement("h1");
	Title.className = "absolute tracking-widest text-6xl neon-matrix top-25";
	Title.textContent = translations[getCurrentLang()].tournament;
	mainContainer.appendChild(Title);

	const TournamentContainer = document.createElement("div");
	TournamentContainer.className = "tournament-container flex flex-col lg:flex-row items-center justify-center gap-10 w-full px-4";

	const HostContainer = document.createElement("div");
	HostContainer.className = "flex flex-col items-center justify-center border-2 rounded-xl p-10 gap-8 w-[30vw] h-[70vh] #sm:w-[80vw]md:w-[60vw]lg:w-[30vw]min-h-[20rem]";

	HostContainer.appendChild(CreateSlider(nb_players, translations[getCurrentLang()].player_number, 2, 20)); // add render function for db

	interface game {
		name: string,
		password: string,
	}

	const hostgame :game = {name: "", password: ""};

	const GameName = document.createElement("input");
	GameName.className = "w-full border-2 rounded-xl text-xl p-2";
	GameName.placeholder = translations[getCurrentLang()].tournament_name;
	HostContainer.appendChild(GameName);

	const GamePassword = document.createElement("input");
	GamePassword.className = "w-full border-2 rounded-xl text-xl p-2";
	GamePassword.placeholder = translations[getCurrentLang()].password;
	GamePassword.type = "password";
	HostContainer.appendChild(GamePassword);

	const EyePassword = document.createElement("img");
	EyePassword.className = "absolute right-2 top-1/5 cursor-pointer w-7 h-7 duration-500 transtion-all hover:scale-110";
	EyePassword.src = "/eye-off.svg";
	EyePassword.alt = "Show/Hide";
	EyePassword.onclick = () => togglePassword(GamePassword, EyePassword);
	HostContainer.appendChild(createInputWithEye(GamePassword, EyePassword));

	const HostBtn = CreateWrappedButton(mainContainer, translations[getCurrentLang()].host, "/tournament", 5);
	HostBtn.className = "mt-6";
	HostBtn.addEventListener("click", () => {
		hostgame.name = GameName.value;
		hostgame.password = GamePassword.value;
		GameName.value = "";
		GamePassword.value = "";
	});
	HostContainer.appendChild(HostBtn);

	const JoinContainer = document.createElement("div");
	JoinContainer.className = "flex flex-col items-center justify-center border-2 rounded-xl p-10 gap-8 w-[30vw] h-[70vh] #sm:w-[80vw]md:w-[60vw]lg:w-[30vw]min-h-[20rem]";

	const JoinBtn = CreateWrappedButton(mainContainer, translations[getCurrentLang()].join, "/tournament", 5);
	JoinBtn.className = "mt-6";
	JoinContainer.appendChild(JoinBtn);

	TournamentContainer.appendChild(HostContainer); 
	TournamentContainer.appendChild(JoinContainer);


	mainContainer.appendChild(TournamentContainer);

	return (mainContainer);
}

export function PongTournamentInterfacePage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "gap-5 pt-25 min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black";

	const Title = document.createElement("h1");
	Title.className = "tracking-widest text-6xl neon-matrix mb-15";
	Title.textContent = translations[getCurrentLang()].tournament;
	mainContainer.appendChild(Title);

	// Rangée centrée et responsive pour les boutons
	const ButtonsRow = document.createElement("div");
	ButtonsRow.className = "flex flex-wrap items-center justify-center gap-6 mt-8";

	const BackToMenuBtn = CreateWrappedButton(mainContainer, translations[getCurrentLang()].back, "/tournament/menu", 3);
	BackToMenuBtn.className = "";

	const BackToRootBtn = CreateWrappedButton(mainContainer, translations[getCurrentLang()].back, "/tournament", 3);
	BackToRootBtn.className = "";

	ButtonsRow.appendChild(BackToMenuBtn);
	ButtonsRow.appendChild(BackToRootBtn);
	mainContainer.appendChild(ButtonsRow);

	return (mainContainer);
}
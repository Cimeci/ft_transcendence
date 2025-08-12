import { getCurrentLang } from "./settings";
import { translations } from "../i18n";
import { CreateWrappedButton } from "./pong";

let nb_players = {value: 2};

export function CreateSlider(ref: { value: number }, txt: string, minValue: number, maxValue: number, onChange?: (v: number) => void) : HTMLElement
{
	const SliderContainer = document.createElement("div");
	SliderContainer.className = "bg-white rounded-lg shadow-lg p-6 w-full max-w-md";

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
		InputSlider.className += "pl-2"
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
	mainContainer.className = "gap-5 pt-25 min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black"

	const Title = document.createElement("h1");
	Title.className = "tracking-widest text-6xl neon-matrix mb-15";
	Title.textContent = translations[getCurrentLang()].tournament;
	mainContainer.appendChild(Title);

	const TournamentContainer = document.createElement("div");
	TournamentContainer.className = "card-grid flex";

	const HostContainer = document.createElement("div");
	HostContainer.className = "gap-20";

	HostContainer.appendChild(CreateSlider(nb_players, translations[getCurrentLang()].player_number, 2, 20)); // add render function for db

	const HostBtn = CreateWrappedButton(mainContainer, translations[getCurrentLang()].host, "/tournament", 4);
	HostContainer.appendChild(HostBtn);

	const JoinContainer = document.createElement("div");
	JoinContainer.className = "gap-20";

	JoinContainer.appendChild(CreateSlider(nb_players, translations[getCurrentLang()].player_number, 2, 20)); // add render function for db

	const JoinBtn = CreateWrappedButton(mainContainer, translations[getCurrentLang()].join, "/tournament", 4);
	JoinContainer.appendChild(JoinBtn);

	TournamentContainer.appendChild(HostContainer);
	TournamentContainer.appendChild(JoinContainer);


	mainContainer.appendChild(TournamentContainer);

	return (mainContainer);
}

export function PongTournamentInterfacePage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "gap-5 pt-25 min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-br from-black via-green-900 to-black"

	const Title = document.createElement("h1");
	Title.className = "tracking-widest text-6xl neon-matrix mb-15";
	Title.textContent = translations[getCurrentLang()].tournament;
	mainContainer.appendChild(Title);

	const BackBtn = CreateWrappedButton(mainContainer, translations[getCurrentLang()].back, "/tournament/menu", 3);
	BackBtn.className = "absolute bottom-0 left-0 width-10 height-10"
	mainContainer.appendChild(BackBtn);

	const Btn = CreateWrappedButton(mainContainer, translations[getCurrentLang()].back, "/tournament", 3);
	BackBtn.className = "absolute bottom-0 left-0 width-10 height-10"
	mainContainer.appendChild(BackBtn);


	return (mainContainer);
}
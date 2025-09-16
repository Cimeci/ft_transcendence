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

	// Affichages: courant (gauche) et max (droite)
	const current = document.createElement("span");
	const max = document.createElement("span");
	// Construit la liste des valeurs par paliers *2
	const values: number[] = [];
	const start = Math.max(1, Math.floor(minValue)); // sécurité (>0)
	let v2 = start;
	while (v2 <= maxValue) { values.push(v2); v2 *= 2; }
	// Index initial: le plus proche de ref.value (ou 0)
	let initIdx = 0;
	if (typeof ref.value === "number" && ref.value > 0) {
		initIdx = values.reduce((best, val, idx) =>
			Math.abs(val - ref.value) < Math.abs(values[best] - ref.value) ? idx : best, 0);
	}
	ref.value = values[initIdx];
	current.textContent = String(values[initIdx]);

	max.textContent = String(values[values.length - 1]);

    const InputSlider = document.createElement("input");
    InputSlider.type = "range";
	InputSlider.className = "rounded-range w-full";
	if (ref.value > 0) InputSlider.className += " pl-2";
	// Slider sur indices [0 .. values.length-1]
	InputSlider.min = "0";
	InputSlider.max = String(Math.max(0, values.length - 1));
	InputSlider.step = "1";
	InputSlider.value = String(initIdx);
	InputSlider.oninput = (event) => {
		const idx = Number((event.target as HTMLInputElement).value);
		const val = values[Math.min(values.length - 1, Math.max(0, idx))];
		ref.value = val;
		current.textContent = String(val);
		onChange?.(val);
	};
    TopSlider.appendChild(InputSlider);

    SliderContainer.appendChild(TopSlider);
	Slider.appendChild(current);
    Slider.appendChild(max);
    SliderContainer.appendChild(Slider);

    return (SliderContainer);
}
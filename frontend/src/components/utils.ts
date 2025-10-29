import { getUser } from "../linkUser";
import { navigateTo } from "../routes";

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

    return SliderContainer;
}

export function CreateWrappedButton(mainContainer: HTMLElement, txt: string, path: string, size: number): HTMLElement {
    const PlayContainer = document.createElement("div");
    PlayContainer.className = "flex flex-col justify-center items-center gap-4 text-center";

    const PlayBtnWrapper = document.createElement("div");
    PlayBtnWrapper.className = "relative inline-flex items-center justify-center animated-gradient-border rounded-full p-[clamp(2px,0.6vw,8px)] mb-2 w-fit h-fit";

    const PlayBtn = document.createElement("button");
    PlayBtn.className = "relative z-10 inline-flex items-center justify-center whitespace-nowrap leading-none w-fit h-fit cursor-pointer transition-all duration-300 hover:scale-98 text-" + String(size) + "xl tracking-widest text-green-400 neon-matrix rounded-full px-12 py-6 bg-linear-to-bl from-black via-green-900 to-black border-none";
    PlayBtn.textContent = txt;

    PlayBtn.addEventListener('click', () => {
        if (path != "null")
        {
            mainContainer.classList.add("fade-out");
            setTimeout(() => {
                navigateTo(path);
            }, 1000);
        }
    });

    PlayBtnWrapper.appendChild(PlayBtn);
    PlayContainer.appendChild(PlayBtnWrapper);

    return (PlayContainer);
}

export async function SetWallet(uuid: string, amount: Number)
{
    const jwt = localStorage.getItem("jwt") || "";

    const response = await fetch('/user/wallet', {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid: uuid, amount: amount })
    });

    if (!response.ok) {
        console.error('Erreur:', response.status);
        return;
    }
}

export async function getUidInventory(uuid: string){
    console.log("getuuisInventory uuiiiiddididiid: ", uuid);
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return new Error("jwt");
    try {
        const r2 = await fetch(`/user/${encodeURIComponent(uuid)}`,{
            method: "GET",
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            }
        });
        console.log("RESP GET UUID: ", r2);
        if (r2.ok) {
            const { user } = await r2.json();
            return {
                id: uuid,
                username: user.username,
                avatar: user.avatar_use[0].id,
            };
        }
    } catch (e){
        console.error("GET uuid inventory", e)
    }
    return { id: uuid, username: uuid, avatar: "/avatar/default_avatar.png" };
}

export async function Invitation(game_uuid: string, friend_uuid: string, mode: string)
{
    console.log("INVITATION INFO:", game_uuid, "| " ,friend_uuid, "| ", mode)
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return new Error("Error JWT");
    try {
        const resp = await fetch(`/user/invit/${encodeURIComponent(friend_uuid)}`, {
			method: "POST",
			headers: {
			    'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uuid: game_uuid,
                mode: mode
            })
		});
        console.log("RESP POST INVIT: ", resp);
        if (!resp.ok)
        {
            console.error(resp.status);
        }
        else
            return (true);
    } catch (e) {
        console.error("POST INVITATION: ", e);
    }
    return false;
}
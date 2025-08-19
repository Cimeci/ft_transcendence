import { translations } from "../i18n";
import { getCurrentLang } from "./settings";
import { userInventory, userName } from "./inventory";

export let inputRef: HTMLInputElement | null = null;

export function FriendsPage(): HTMLElement {

	const mainContainer = document.createElement("div");
	mainContainer.className = "gap-5 p-25 min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-bl from-black via-green-900 to-black";

	const title = document.createElement("h2");
	title.textContent = translations[getCurrentLang()].friends;
	title.className = "fixed top-0 p-6 z-1000";
	mainContainer.appendChild(title);

	const PageContainer = document.createElement("div");
	PageContainer.className = "w-full flex lg:flex-row flex-col gap-15 justify-between items-center";

	{
		const profileContainer = document.createElement("div");
		profileContainer.className = "lg:w-[25vw] w-[80vw] h-[70vh] flex flex-col p-10 border-3 rounded-xl items-center gap-[10vh]";

		const imgProfile = document.createElement("img");
		imgProfile.src = userInventory.avatar[0].id;
		imgProfile.className = "w-40 h-40 hover:scale-110 duration-300 transtion-all p-1 border-2 rounded-xl";
		profileContainer.appendChild(imgProfile);

		const NameProfile = document.createElement("h1");
		NameProfile.textContent = userName;
		NameProfile.className = "whitespace-nowrap text-xl sm:text-2xl w-full border-2 rounded-xl p-3 overflow-x-auto";
		profileContainer.appendChild(NameProfile);

		const IdProfile = document.createElement("h1");
		IdProfile.textContent = "id";
		IdProfile.className = "whitespace-nowrap text-xl sm:text-2xl w-full border-2 rounded-xl p-3 overflow-x-auto";
		profileContainer.appendChild(IdProfile);

		PageContainer.appendChild(profileContainer);
	}

		const FriendMenu = document.createElement("div");
		FriendMenu.className = "lg:w-[70vw] w-[80vw] h-[70vh] flex flex-col border-3 rounded-xl items-center";

		const SelectContainer = document.createElement("div");
		SelectContainer.className = "flex-none h-[50px] min-h-[50px] max-h-[50px] w-full bg-white/5 flex items-center relative overflow-hidden"

		const FriendsSelector = document.createElement("btn");
		FriendsSelector.textContent = translations[getCurrentLang()].friends.toUpperCase();
		FriendsSelector.className = "rounded-xl flex-1 h-full flex items-center justify-center cursor-pointer select-none"
		SelectContainer.appendChild(FriendsSelector);

		const SearchSelector = document.createElement("btn");
		SearchSelector.textContent = translations[getCurrentLang()].search.toUpperCase();
		SearchSelector.className = "rounded-xl flex-1 h-full flex items-center justify-center cursor-pointer select-none"
		SelectContainer.appendChild(SearchSelector);

		const InvitationSelector = document.createElement("btn");
		InvitationSelector.textContent = translations[getCurrentLang()].invitation.toUpperCase();
		InvitationSelector.className = "rounded-xl flex-1 h-full flex items-center justify-center cursor-pointer select-none"
		SelectContainer.appendChild(InvitationSelector);

		const indicator = document.createElement("div");
		indicator.className = "absolute bottom-0 h-1 bg-green-500 rounded-full transition-all duration-300 pointer-events-none";
		SelectContainer.appendChild(indicator);

		FriendMenu.appendChild(SelectContainer);

		const line = document.createElement("p");
		line.className = "border-3 border-green-400 w-full";
		FriendMenu.appendChild(line);

		{
			type Friend = { id: string; username: string };
			// Démo: remplace par tes données //! DB
			const users: Friend[] = [
				{ id: "u1001", username: "neo" },
				{ id: "u1002", username: "trinity" },
				{ id: "u1003", username: "morpheus" },
				{ id: "u1004", username: "smith" },
				{ id: "u1005", username: "oracle" },
				{ id: "u1006", username: "timothy" },
				{ id: "u1007", username: "amaury" },
				{ id: "u1008", username: "manuarii" },
				{ id: "u1009", username: "remy" },
			];

			let data: Friend[] = users.slice();

			const createUserActionsDropdown = (u: Friend, onRemove: () => void, onBlock: () => void): HTMLElement => {
				const wrap = document.createElement("div");
				wrap.className = "relative justify-self-end";

				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = "shrink-0 inline-flex items-center justify-center rounded-lg px-2.5 py-1 bg-green-600 text-white hover:bg-green-700";
				btn.setAttribute("aria-label", "Actions");

				const sr = document.createElement("span");
				sr.className = "sr-only";
				sr.textContent = "Open actions";
				btn.appendChild(sr);

				const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				chevron.setAttribute("class", "w-4 h-4");
				chevron.setAttribute("viewBox", "0 0 10 6");
				chevron.setAttribute("aria-hidden", "true");
				chevron.setAttribute("fill", "none");

				const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
				p.setAttribute("stroke", "currentColor");
				p.setAttribute("stroke-linecap", "round");
				p.setAttribute("stroke-linejoin", "round");
				p.setAttribute("stroke-width", "2");
				p.setAttribute("d", "M1 1l4 4 4-4");
				chevron.appendChild(p);
				btn.appendChild(chevron);
				wrap.appendChild(btn);

				const menu = document.createElement("div");
				menu.className = "hidden absolute right-0 mt-2 z-20 w-44 bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 overflow-hidden";
				
				const ul = document.createElement("ul");
				ul.className = "py-2 text-sm text-gray-700 dark:text-gray-200";

				const liProfile = document.createElement("li");
				const aProfile = document.createElement("a");
				aProfile.href = `/user?id=${encodeURIComponent(u.id)}`;
				aProfile.setAttribute("data-link", "");
				aProfile.className = "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white";
				aProfile.textContent = translations[getCurrentLang()].profile ?? "Profile";
				liProfile.appendChild(aProfile);
				ul.appendChild(liProfile);

				const liRemove = document.createElement("li");
				const btnRemove = document.createElement("button");
				btnRemove.type = "button";
				btnRemove.className = "inline-flex w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white";
				btnRemove.textContent = translations[getCurrentLang()].delete ?? "Remove";
				btnRemove.addEventListener("click", () => { onRemove(); menu.classList.add("hidden"); });
				liRemove.appendChild(btnRemove);
				ul.appendChild(liRemove);

				const liBlock = document.createElement("li");
				const btnBlock = document.createElement("button");
				btnBlock.type = "button";
				btnBlock.className = "inline-flex w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white";
				btnBlock.textContent = translations[getCurrentLang()].block ?? "Block";
				btnBlock.addEventListener("click", () => { onBlock(); menu.classList.add("hidden"); });
				liBlock.appendChild(btnBlock);
				ul.appendChild(liBlock);

				menu.appendChild(ul);
				wrap.appendChild(menu);

				btn.addEventListener("click", (e) => {
					e.stopPropagation();
					menu.classList.toggle("hidden");
				});
				document.addEventListener("click", (e) => {
					if (!wrap.contains(e.target as Node)) menu.classList.add("hidden");
				});

				return wrap;
			};

			let FriendContainer!: HTMLDivElement;
			{
                const FriendContainer = document.createElement("div");
                FriendContainer.className = "w-full h-9/10 flex flex-col p-10 items-center gap-8";
                FriendContainer.dataset.section = "friends";
                FriendContainer.classList.remove("hidden");
                // @ts-ignore
                window.__friendSection = FriendContainer;
                FriendMenu.appendChild(FriendContainer);

				// Search bar + liste dans FriendContainer
				const form = document.createElement("form");
				form.className = "w-full";

				const label = document.createElement("label");
				label.htmlFor = "friends-search";
				label.className = "mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white";
				label.textContent = "Search";
				form.appendChild(label);

				const container = document.createElement("div");
				container.className = "relative";
				form.appendChild(container);

				const iconWrapper = document.createElement("div");
				iconWrapper.className = "absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none";

				const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("class", "w-4 h-4 text-gray-500 dark:text-gray-400");
				svg.setAttribute("aria-hidden", "true");
				svg.setAttribute("fill", "none");
				svg.setAttribute("viewBox", "0 0 20 20");
				svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

				const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute("stroke", "currentColor");
				path.setAttribute("stroke-linecap", "round");
				path.setAttribute("stroke-linejoin", "round");
				path.setAttribute("stroke-width", "2");
				path.setAttribute("d", "m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z");
				svg.appendChild(path);
				iconWrapper.appendChild(svg);
				container.appendChild(iconWrapper);

				const input = document.createElement("input");
				input.type = "search";
				input.id = "friends-search";
				input.className = "block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500";
				input.placeholder = `${translations[getCurrentLang()].search} username, id...`;
				input.required = true;
				container.appendChild(input);
				inputRef = input;

				const button = document.createElement("button");
				button.type = "submit";
				button.className = "text-white absolute end-2.5 bottom-2.5 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800";
				button.textContent = translations[getCurrentLang()].search;
				container.appendChild(button);
				FriendContainer.appendChild(form);

				const FriendsList = document.createElement("ul");
				FriendsList.className = "w-full border-2 rounded-xl divide-y overflow-y-auto h-full";
				FriendContainer.appendChild(FriendsList);

				const renderFriends = () => {
                    const q = input.value.trim().toLowerCase();
					const filtered = data.filter(u => !q || u.username.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
                    FriendsList.innerHTML = "";
                    if (filtered.length === 0) {
                        const li = document.createElement("li");
                        li.className = "p-3 text-center text-gray-400";
                        // @ts-ignore
                        li.textContent = translations[getCurrentLang()].no_result ?? "No result";
                        FriendsList.appendChild(li);
                        return;
                    }
                    for (const u of filtered) {
                        const li = document.createElement("li");
                        li.className = "p-3 min-w-0 grid grid-cols-[1fr_1fr_auto] items-center gap-3";

                        const name = document.createElement("span");
                        name.className = "font-medium truncate";
                        name.textContent = u.username;

                        const uid = document.createElement("span");
                        uid.className = "text-sm text-gray-400 truncate";
                        uid.textContent = u.id;

						const menu = createUserActionsDropdown(
							u,
							() => { data = data.filter(x => x.id !== u.id); renderFriends(); },
							() => { data = data.filter(x => x.id !== u.id); renderFriends(); }
						);

                        li.appendChild(name);
                        li.appendChild(uid);
                        li.appendChild(menu);
                        FriendsList.appendChild(li);
                    }
                };
				input.addEventListener("input", renderFriends);
				form.addEventListener("submit", (e) => { e.preventDefault(); renderFriends(); });
				renderFriends();
            }

			let SearchContainer!: HTMLDivElement;
			{
				const SearchContainer = document.createElement("div");
				SearchContainer.className = "w-full h-9/10 flex flex-col p-10 items-center gap-8 hidden";
				SearchContainer.dataset.section = "search";
				// expose ref
				// @ts-ignore
				window.__searchSection = SearchContainer;
				//! Search Bar
				const SearchBar = document.createElement("form");
				SearchBar.className = "w-full";

				const row = document.createElement("div");
				row.className = "flex relative";

				const search_dropdown = document.createElement("label");
				search_dropdown.className = "mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white";
				search_dropdown.textContent = "User id";
				row.appendChild(search_dropdown);

				// Dropdown_btn //
				const dropdown_btn = document.createElement("button");
				dropdown_btn.id = "dropdown-button";
				dropdown_btn.type = "button";
				dropdown_btn.dataset.dropdownToggle = "dropdown";
				dropdown_btn.className =
					"shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 " +
					"bg-green-100 border border-green-300 rounded-s-lg hover:bg-green-200 focus:ring-4 focus:outline-none " +
					"focus:ring-green-100 dark:bg-green-700 dark:hover:bg-green-600 dark:focus:ring-green-700 dark:text-white " +
					"dark:border-green-600";
				const dropdown_label = document.createElement("span");
				dropdown_label.textContent = "All categories";
				dropdown_btn.appendChild(dropdown_label);

				const svg: SVGSVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("class", "w-2.5 h-2.5 ms-2.5");
				svg.setAttribute("aria-hidden", "true");
				svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
				svg.setAttribute("fill", "none");
				svg.setAttribute("viewBox", "0 0 10 6");

				const path: SVGPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute("stroke", "currentColor");
				path.setAttribute("stroke-linecap", "round");
				path.setAttribute("stroke-linejoin", "round");
				path.setAttribute("stroke-width", "2");
				path.setAttribute("d", "m1 1 4 4 4-4");

				svg.appendChild(path);
				dropdown_btn.appendChild(svg);

				row.appendChild(dropdown_btn);

				// Dropdown
				const dropdown: HTMLDivElement = document.createElement("div");
				dropdown.id = "dropdown";
				dropdown.className = "z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 absolute mt-12";

				const ul: HTMLUListElement = document.createElement("ul");
				ul.className = "py-2 text-sm text-gray-700 dark:text-gray-200";
				ul.setAttribute("aria-labelledby", "dropdown-button");

				const items = [translations[getCurrentLang()].all, translations[getCurrentLang()].user_id, translations[getCurrentLang()].username];

				items.forEach(text => {
					const li: HTMLLIElement = document.createElement("li");
					const btn: HTMLButtonElement = document.createElement("button");
					btn.type = "button";
					btn.className = "inline-flex w-full px-4 py-2 hover:bg-green-100 dark:hover:bg-green-700 dark:hover:text-white";
					btn.textContent = text;
					btn.addEventListener("click", () => {
						(dropdown_btn.querySelector("span") as HTMLSpanElement).textContent = text;
						dropdown.classList.add("hidden");
						// @ts-ignore
						inputRef?.focus();
					});
					li.appendChild(btn);
					ul.appendChild(li);
				});

				dropdown.appendChild(ul);

				row.appendChild(dropdown);

				dropdown_btn.addEventListener("click", (e) => {
					e.preventDefault();
					dropdown.classList.toggle("hidden");
				});
				document.addEventListener("click", (e) => {
					const t = e.target as Node;
					if (!dropdown.contains(t) && !dropdown_btn.contains(t)) dropdown.classList.add("hidden");
				});

				// Input
				const container: HTMLDivElement = document.createElement("div");
				container.className = "relative w-full";

				const input: HTMLInputElement = document.createElement("input");
				input.type = "search";
				input.id = "search-dropdown";
				input.className = "block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-s-gray-700  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-green-500";
				input.placeholder = `${translations[getCurrentLang()].search} ${translations[getCurrentLang()].username}, ${translations[getCurrentLang()].user_id}...`;
				input.required = true;
				inputRef = input;

				const button: HTMLButtonElement = document.createElement("button");
				button.type = "submit";
				button.className = "absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-green-700 rounded-e-lg border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800";

				const svgInput: SVGSVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svgInput.setAttribute("class", "w-4 h-4");
				svgInput.setAttribute("aria-hidden", "true");
				svgInput.setAttribute("xmlns", "http://www.w3.org/2000/svg");
				svgInput.setAttribute("fill", "none");
				svgInput.setAttribute("viewBox", "0 0 20 20");

				const pathInput: SVGPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
				pathInput.setAttribute("stroke", "currentColor");
				pathInput.setAttribute("stroke-linecap", "round");
				pathInput.setAttribute("stroke-linejoin", "round");
				pathInput.setAttribute("stroke-width", "2");
				pathInput.setAttribute("d", "m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z");

				const span: HTMLSpanElement = document.createElement("span");
				span.className = "sr-only";
				span.textContent = "Search";

				svgInput.appendChild(pathInput);
				button.appendChild(svgInput);
				button.appendChild(span);

				container.appendChild(input);
				container.appendChild(button);
				row.appendChild(container);
			
				SearchBar.appendChild(row);

				const Results = document.createElement("ul");
				Results.className = "w-full border-2 rounded-xl divide-y overflow-y-auto h-full";

				SearchContainer.appendChild(SearchBar);
				SearchContainer.appendChild(Results);

				const t = translations[getCurrentLang()];
				const getCategory = (): 'all' | 'user_id' | 'username' => {
					const label = (dropdown_btn.querySelector("span") as HTMLSpanElement).textContent || t.all;
					return label === t.user_id ? 'user_id' : label === t.username ? 'username' : 'all';
				};

				const render = () => {
					const q = input.value.trim().toLowerCase();
					const cat = getCategory();
					const filtered = users.filter(u => {
						if (!q) return true;
						if (cat === 'user_id')
							return u.id.toLowerCase().includes(q);
						if (cat === 'username')
							return u.username.toLowerCase().includes(q);
						return u.id.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
					});
					Results.innerHTML = "";
					if (filtered.length === 0) {
						const li = document.createElement("li");
						li.className = "p-3 text-center text-gray-400";
						// @ts-ignore
						li.textContent = translations[getCurrentLang()].no_result;
						Results.appendChild(li);
						return;
					}
					for (const u of filtered) {
						const li = document.createElement("li");
						li.className = "p-3 min-w-0 grid grid-cols-[1fr_1fr_auto] items-center gap-3";

						const name = document.createElement("span");
						name.className = "font-medium truncate";
						name.textContent = u.username;

						const uid = document.createElement("span");
						uid.className = "text-sm text-gray-400 truncate";
						uid.textContent = u.id;

						const add_btn = document.createElement("btn");
						add_btn.textContent = translations[getCurrentLang()].add;
						add_btn.className = "cursor-pointer justify-self-end shrink-0 rounded-lg px-3 py-1 bg-green-500 duration-300 transition-all hover:scale-102 hover:bg-green-600 onclick:scale-104";

						li.appendChild(name);
						li.appendChild(uid);
						li.appendChild(add_btn);
						Results.appendChild(li);
					}
				};

				input.addEventListener("input", render);
				SearchBar.addEventListener("submit", (e) => { e.preventDefault(); render(); });
				ul.querySelectorAll("button").forEach(b => b.addEventListener("click", render));
				render();

				FriendMenu.appendChild(SearchContainer);
			}

			let InvitationContainer!: HTMLDivElement;
			{
				const InvitationContainer = document.createElement("div");
				InvitationContainer.className = "w-full h-9/10 flex flex-col p-10 items-center gap-8 hidden";
				InvitationContainer.dataset.section = "invites";
				// expose ref
				// @ts-ignore
				window.__invSection = InvitationContainer;
				FriendMenu.appendChild(InvitationContainer);
			}

			PageContainer.appendChild(FriendMenu);
		}
	
	mainContainer.appendChild(PageContainer);
	// Toggle sections
	const sections = {
		friends: () => (window as any).__friendSection as HTMLDivElement,
		search: () => (window as any).__searchSection as HTMLDivElement,
		invites: () => (window as any).__invSection as HTMLDivElement,
	};
	const selectors: Record<"friends"|"search"|"invites", HTMLElement> = {
		friends: FriendsSelector, search: SearchSelector, invites: InvitationSelector
	};
	let current: "friends"|"search"|"invites" = "friends";
	const moveIndicator = (el: HTMLElement) => {
		const left = (el as HTMLElement).offsetLeft;
		const width = (el as HTMLElement).offsetWidth;
		indicator.style.left = `${left}px`;
		indicator.style.width = `${width}px`;
	};
	const setActive = (name: "friends"|"search"|"invites") => {
		current = name;
		sections.friends().classList.toggle("hidden", name !== "friends");
		sections.search().classList.toggle("hidden", name !== "search");
		sections.invites().classList.toggle("hidden", name !== "invites");
		Object.entries(selectors).forEach(([k, el]) => {
			el.classList.toggle("text-green-400", k === name);
			el.classList.toggle("font-semibold", k === name);
		});
		moveIndicator(selectors[name]);
	};
	// Listeners
	FriendsSelector.addEventListener("click", () => setActive("friends"));
	SearchSelector.addEventListener("click", () => setActive("search"));
	InvitationSelector.addEventListener("click", () => setActive("invites"));
	[FriendsSelector, SearchSelector, InvitationSelector].forEach(el => {
		(el as HTMLElement).tabIndex = 0;
		el.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") setActive(
				el === FriendsSelector ? "friends" : el === SearchSelector ? "search" : "invites"
			);
		});
	});
	requestAnimationFrame(() => setActive("friends"));
	window.addEventListener("resize", () => moveIndicator(selectors[current]));
	return mainContainer;
}
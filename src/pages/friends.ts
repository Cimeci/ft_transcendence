import { translations } from "../i18n";
import { getCurrentLang } from "./settings";
import { userInventory } from "./inventory";
import { userName } from "./settings"

export let inputRef: HTMLInputElement | null = null;

export type InvitePayload = {
  	username: string;
  	id: string;
  	avatar: string;
  	message?: string;
  	onAccept?: () => void;
  	onRefuse?: () => void;
};

type Friend = { id: string; username: string; invitation: string, avatar: string };
// Démo: remplace par tes données //! DB //! trad invitation
export const users: Friend[] = [
	{ id: "u1001", username: "neo", invitation: "Send invitation to play tournament", avatar: "/avatar/default_avatar.png" },
	{ id: "u1002", username: "trinity", invitation: "Send friend request", avatar: "/avatar/default_avatar.png" },
	{ id: "u1003", username: "ilan", invitation: "Send 1v1", avatar: "/avatar/inowak--.jpg" },
	{ id: "u1004", username: "pierre louis", invitation: "Send invitation to play tournament", avatar: "/avatar/pjurdana.jpg" },
	{ id: "u1005", username: "xavier", invitation: "Send invitation to play tournament", avatar: "/avatar/xavierchad.gif" },
	{ id: "u1006", username: "timothy", invitation: "Send 1v1", avatar: "/avatar/tcybak.jpg" },
	{ id: "u1007", username: "amaury", invitation: "Send 1v1", avatar: "/avatar/amblanch.jpg" },
	{ id: "u1008", username: "manuarii", invitation: "Send friend request", avatar: "/avatar/mdegache.jpg" },
	{ id: "u1009", username: "remy", invitation: "Send friend request", avatar: "/avatar/rgodet.jpg" },
];

export function FriendsPage(): HTMLElement {

	const mainContainer = document.createElement("div");
	mainContainer.className = "gap-5 p-25 min-h-screen w-full flex items-center flex-col justify-center bg-linear-to-bl from-black via-green-900 to-black";

	const title = document.createElement("h2");
	title.textContent = translations[getCurrentLang()].friends;
	title.className = "tracking-widest fixed top-0 p-6 z-1000";
	mainContainer.appendChild(title);

	const PageContainer = document.createElement("div");
	PageContainer.className = "w-full flex lg:flex-row flex-col xl:gap-12 gap-8 transition-all duration-300 justify-between items-center";

		// Classe commune pour des lignes de même hauteur partout
		const ROW_CLASS = "min-w-0 grid grid-cols-[1fr_1fr_auto] items-center gap-2 p-2.5 min-h-12";
		const ACTION_BTN = "inline-flex items-center justify-center h-8 px-3 rounded-lg";
		const ICON_SM = "w-4 h-4";

        function enableEllipsisThenScroll(el: HTMLElement, fullText: string) {
			el.title = fullText;
			const enter = () => {
				el.classList.add("overflow-x-auto", "text-clip", "cursor-text");
				el.classList.remove("truncate");
			};
			const leave = () => {
				el.classList.remove("overflow-x-auto", "text-clip");
				el.classList.add("truncate");
				el.scrollLeft = 0;
			};
			el.addEventListener("mouseenter", enter);
			el.addEventListener("mouseleave", leave);
			el.addEventListener("focus", enter);
			el.addEventListener("blur", leave);
			el.tabIndex = 0; // pour focus clavier
		}

        const profileContainer = document.createElement("div");
		profileContainer.className = "lg:w-[25vw] w-[80vw] h-[70vh] flex flex-col border-3 p-10 rounded-xl items-center justify-around";

		const imgBox = document.createElement("div");
		imgBox.className = "max-h-60 w-50 sm:w-60 lg:w-50 duration-300 aspect-square";
		profileContainer.appendChild(imgBox);

		const imgProfile = document.createElement("img");
		imgProfile.src = userInventory.avatar[0].id;
		imgProfile.alt = "profile";
		imgProfile.className = "w-full h-full object-cover hover:scale-105 transition-transform duration-300 p-1 border-2 rounded-xl";
		imgBox.appendChild(imgProfile);

		const txtBox = document.createElement("div");
		txtBox.className = "text-xl sm:text-2xl text-center whitespace-nowrap w-full gap-10 flex flex-col";
		profileContainer.appendChild(txtBox);

		const NameContainer = document.createElement("div");
		NameContainer.className = "flex flex-col";
		txtBox.appendChild(NameContainer);
		
		const NameProfileTxt = document.createElement("h1");
		NameProfileTxt.textContent = translations[getCurrentLang()].username;
		NameContainer.appendChild(NameProfileTxt);

		const NameProfile = document.createElement("h1");
		NameProfile.textContent = userName;
		NameProfile.className = "w-full border-2 rounded-xl p-3 hover:scale-105 transition-transform duration-300 truncate whitespace-nowrap";
		enableEllipsisThenScroll(NameProfile, userName);
		NameContainer.appendChild(NameProfile);

		const IdContainer = document.createElement("div");
		IdContainer.className = "flex flex-col";
		txtBox.appendChild(IdContainer);

		const IdProfileTxt = document.createElement("h1");
		IdProfileTxt.textContent = translations[getCurrentLang()].user_id;
		IdContainer.appendChild(IdProfileTxt);

		const IdProfile = document.createElement("h1");
		IdProfile.textContent = "id";
		IdProfile.className = "w-full border-2 rounded-xl p-3 hover:scale-105 transition-transform duration-300 truncate whitespace-nowrap";
		enableEllipsisThenScroll(IdProfile, IdProfile.textContent || "");
		IdContainer.appendChild(IdProfile);


		PageContainer.appendChild(profileContainer);

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

		const RequestsRecievedSelector = document.createElement("btn");
		RequestsRecievedSelector.textContent = translations[getCurrentLang()].requests_received.toUpperCase();
		RequestsRecievedSelector.className = "rounded-xl flex-1 h-full flex items-center justify-center cursor-pointer select-none"
		SelectContainer.appendChild(RequestsRecievedSelector);

		const RequestSelector = document.createElement("btn");
		RequestSelector.textContent = translations[getCurrentLang()].requests_send.toUpperCase();
		RequestSelector.className = "rounded-xl flex-1 h-full flex items-center justify-center cursor-pointer select-none";
		SelectContainer.appendChild(RequestSelector);

		const indicator = document.createElement("div");
		indicator.className = "absolute bottom-0 h-1 bg-green-500 rounded-full transition-all duration-300 pointer-events-none";
		SelectContainer.appendChild(indicator);

		FriendMenu.appendChild(SelectContainer);

		const line = document.createElement("p");
		line.className = "border-3 border-green-400 w-full";
		FriendMenu.appendChild(line);


			let data: Friend[] = users.slice();

			const createUserActionsDropdown = (u: Friend, onRemove: () => void, onBlock: () => void): HTMLElement => {
				const wrap = document.createElement("div");
				wrap.className = "relative justify-self-end";

				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = `shrink-0 ${ACTION_BTN} bg-green-600 text-white hover:bg-green-700`;
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
				input.className = "block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500";
				input.placeholder = `${translations[getCurrentLang()].search} username, id...`;
				input.required = true;
				container.appendChild(input);
				inputRef = input;

				const button = document.createElement("button");
				button.type = "submit";
				button.className = "text-white absolute end-1.5 bottom-1.5 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800";
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
						li.className = ROW_CLASS;

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
					"dark:border-green-600 max-[600px]:w-10 max-[600px]:px-0 max-[600px]:justify-center";
				dropdown_btn.setAttribute("aria-label", "filter");
    			
				const dropdown_label = document.createElement("span");
				dropdown_label.className = "max-[600px]:hidden";
				dropdown_label.textContent = translations[getCurrentLang()].all;
                dropdown_btn.appendChild(dropdown_label);

				const svg: SVGSVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("class", "w-2.5 h-2.5 ms-2.5 max-[600px]:ms-0");
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
				input.className = "block p-3 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-s-gray-700  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-green-500";
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
						li.className = ROW_CLASS;

						const name = document.createElement("span");
						name.className = "font-medium truncate";
						name.textContent = u.username;

						const uid = document.createElement("span");
						uid.className = "text-sm text-gray-400 truncate";
						uid.textContent = u.id;

						const add_btn = document.createElement("button");
						add_btn.type = "button";
						add_btn.textContent = translations[getCurrentLang()].add;
						add_btn.className = `${ACTION_BTN} justify-self-end bg-green-500 hover:bg-green-600`;

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

			{
				const RequestsRecievedContainer = document.createElement("div");
				RequestsRecievedContainer.className = "w-full h-9/10 flex flex-col p-10 items-center gap-8 hidden";
				RequestsRecievedContainer.dataset.section = "invites";
				// expose ref
				// @ts-ignore
				window.__invSection = RequestsRecievedContainer;
				FriendMenu.appendChild(RequestsRecievedContainer);

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
				input.className = "block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500";
				input.placeholder = `${translations[getCurrentLang()].search} username, id...`;
				input.required = true;
				container.appendChild(input);
				inputRef = input;

				const button = document.createElement("button");
				button.type = "submit";
				button.className = "text-white absolute end-1.5 bottom-1.5 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800";
				button.textContent = translations[getCurrentLang()].search;
				container.appendChild(button);
				RequestsRecievedContainer.appendChild(form);

				const RequestsRecievedList = document.createElement("ul");
				RequestsRecievedList.className = "w-full border-2 rounded-xl divide-y overflow-y-auto h-full";
				RequestsRecievedContainer.appendChild(RequestsRecievedList);

				const renderRequestsRecieved = () => {
                    const q = input.value.trim().toLowerCase();
					const filtered = data.filter(u => !q || u.username.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
                    RequestsRecievedList.innerHTML = "";
                    if (filtered.length === 0) {
                        const li = document.createElement("li");
                        li.className = "p-3 text-center text-gray-400";
                        // @ts-ignore
                        li.textContent = translations[getCurrentLang()].no_result ?? "No result";
                        RequestsRecievedList.appendChild(li);
                        return;
                    }
                    for (const u of filtered) {
                        const li = document.createElement("li");
                        li.className = "p-3 min-w-0 grid grid-cols-[1fr_1fr_auto] items-center lg:gap-3 sm:gap-2 gap-1";

                        const name = document.createElement("span");
                        name.className = "font-medium truncate";
                        name.textContent = u.username;

                        const uid = document.createElement("span");
                        uid.className = "text-sm text-gray-400 truncate";
                        uid.textContent = u.id;

						const btndiv = document.createElement("div");
						btndiv.className = "flex gap-2 truncate";

						const refuse = document.createElement("button");
						refuse.className = `${ACTION_BTN} bg-red-500 hover:bg-red-600`;
                        const imgrefuse = document.createElement("img");
						imgrefuse.src = "/icons/cross.svg"; imgrefuse.className = `${ICON_SM}`;
                        refuse.appendChild(imgrefuse);
                        btndiv.appendChild(refuse);

                        const accept = document.createElement("button");
						accept.className = `${ACTION_BTN} bg-green-500 hover:bg-green-600`;
                        const imgaccept = document.createElement("img");
						imgaccept.src = "/icons/check.svg"; imgaccept.className = `${ICON_SM}`;
                        accept.appendChild(imgaccept);
                        btndiv.appendChild(accept);

						//! changer cela pour le add

                        accept.addEventListener("click", () => {
                          window.showInvite({
                            username: u.username,
                            id: u.id,
                            avatar: u.avatar,
                            message: u.invitation,
                          });
                        });

                        li.appendChild(name);
                        li.appendChild(uid);
                        li.appendChild(btndiv);
                        RequestsRecievedList.appendChild(li);
                    }
                };
				input.addEventListener("input", renderRequestsRecieved);
				form.addEventListener("submit", (e) => { e.preventDefault(); renderRequestsRecieved(); });
				renderRequestsRecieved();
			}

			{
				const RequestsContainer = document.createElement("div");
				RequestsContainer.className = "w-full h-9/10 flex flex-col p-10 items-center gap-8 hidden";
				RequestsContainer.dataset.section = "requests";
				// expose ref
				// @ts-ignore
				window.__reqSection = RequestsContainer;
				FriendMenu.appendChild(RequestsContainer);

				const sent: Friend[] = users.slice(0, 5);
				let sentData: Friend[] = sent.slice();

				const form = document.createElement("form");
				form.className = "w-full";

				const label = document.createElement("label");
				label.htmlFor = "requests-search";
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
				input.id = "requests-search";
				input.className = "block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500";
				input.placeholder = `${translations[getCurrentLang()].search} username, id...`;
				input.required = true;
				container.appendChild(input);
				inputRef = input;

				const button = document.createElement("button");
				button.type = "submit";
				button.className = "text-white absolute end-1.5 bottom-1.5 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800";
				button.textContent = translations[getCurrentLang()].search;
				container.appendChild(button);
				RequestsContainer.appendChild(form);

				const RequestsList = document.createElement("ul");
				RequestsList.className = "w-full border-2 rounded-xl divide-y overflow-y-auto h-full";
				RequestsContainer.appendChild(RequestsList);

				const renderRequests = () => {
					const q = input.value.trim().toLowerCase();
					const filtered = sentData.filter(u => !q || u.username.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
					RequestsList.innerHTML = "";
					if (filtered.length === 0) {
						const li = document.createElement("li");
						li.className = "p-3 text-center text-gray-400";
						// @ts-ignore
						li.textContent = translations[getCurrentLang()].no_result ?? "No result";
						RequestsList.appendChild(li);
						return;
					}
					for (const u of filtered) {
						const li = document.createElement("li");
						li.className = ROW_CLASS;

						const name = document.createElement("span");
						name.className = "font-medium truncate";
						name.textContent = u.username;

						const uid = document.createElement("span");
						uid.className = "text-sm text-gray-400 truncate";
						uid.textContent = u.id;

						const cancel = document.createElement("button");
						cancel.className = `${ACTION_BTN} bg-red-500 hover:bg-red-600 flex items-center gap-2`;
                        const img = document.createElement("img");
                        img.src = "/icons/cross.svg";
						img.className = ICON_SM;
                        cancel.appendChild(img);
                        const span = document.createElement("span");
                        span.textContent = (translations[getCurrentLang()] as any).cancel ?? "Cancel";
                        span.className = "max-[600px]:hidden";
                        cancel.appendChild(span);
                        cancel.addEventListener("click", () => { sentData = sentData.filter(x => x.id !== u.id); renderRequests(); });

                        li.appendChild(name);
                        li.appendChild(uid);
                        li.appendChild(cancel);
                        RequestsList.appendChild(li);
                    }
				};
				input.addEventListener("input", renderRequests);
				form.addEventListener("submit", (e) => { e.preventDefault(); renderRequests(); });
				renderRequests();
			}

			PageContainer.appendChild(FriendMenu);
	
	mainContainer.appendChild(PageContainer);

	const sections = {
		friends: () => (window as any).__friendSection as HTMLDivElement,
		search: () => (window as any).__searchSection as HTMLDivElement,
		invites: () => (window as any).__invSection as HTMLDivElement,
		requests: () => (window as any).__reqSection as HTMLDivElement,
	};

	const selectors: Record<"friends"|"search"|"invites"|"requests", HTMLElement> = {
		friends: FriendsSelector, search: SearchSelector, invites: RequestsRecievedSelector, requests: RequestSelector
	};

	let current: "friends"|"search"|"invites"|"requests" = "friends";

	const moveIndicator = (el: HTMLElement) => {
		const left = (el as HTMLElement).offsetLeft;
		const width = (el as HTMLElement).offsetWidth;
		indicator.style.left = `${left}px`;
		indicator.style.width = `${width}px`;
	};

	const setActive = (name: "friends"|"search"|"invites"|"requests") => {
		current = name;
		sections.friends().classList.toggle("hidden", name !== "friends");
		sections.search().classList.toggle("hidden", name !== "search");
		sections.invites().classList.toggle("hidden", name !== "invites");
		sections.requests().classList.toggle("hidden", name !== "requests");
		Object.entries(selectors).forEach(([k, el]) => {
			el.classList.toggle("text-green-400", k === name);
			el.classList.toggle("font-semibold", k === name);
		});
		moveIndicator(selectors[name]);
	};

	FriendsSelector.addEventListener("click", () => setActive("friends"));
	SearchSelector.addEventListener("click", () => setActive("search"));
	RequestsRecievedSelector.addEventListener("click", () => setActive("invites"));
	RequestSelector.addEventListener("click", () => setActive("requests"));
	[FriendsSelector, SearchSelector, RequestsRecievedSelector, RequestSelector].forEach(el => {
		(el as HTMLElement).tabIndex = 0;
		el.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") setActive(
				el === FriendsSelector ? "friends" : el === SearchSelector ? "search" : el === RequestsRecievedSelector ? "invites" : "requests"
			);
		});
	});
	requestAnimationFrame(() => setActive("friends"));
	window.addEventListener("resize", () => moveIndicator(selectors[current]));
	return mainContainer;
}
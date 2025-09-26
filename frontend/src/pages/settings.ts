import { translations } from '../i18n';
import { userInventory } from './inventory';
import { getUser, onUserChange, ensureUser } from '../linkUser';

const t = translations[getCurrentLang()];

let username: string = "default";
let email:string = "ilan@42angouleme.fr";
let password:string = "1234";

export function getCurrentLang(): 'fr' | 'en' | 'es' {
	return (localStorage.getItem('lang') as 'fr' | 'en' | 'es') || 'en';
}

function setLanguage(lang: string) {
	localStorage.setItem('lang', lang);
	if (typeof window.renderPage === 'function') window.renderPage();
}

export function createLangSection(): HTMLElement {
	const langDropdownContainer = document.createElement('div');
	langDropdownContainer.style.position = 'relative';

	const langButton = document.createElement('button');
	langButton.type = 'button';
	langButton.className = 'p-5 bg-transparent border-none cursor-pointer flex items-center justify-center';

	const imgBtn = document.createElement("img");
	imgBtn.src = "/icons/translate.svg";
	imgBtn.alt = "Lang";
	imgBtn.className = "w-[5rem] focus:scale-110 hover:scale-110 duration-300 transition-all";
	langButton.appendChild(imgBtn);

	const langMenu = document.createElement('ul');
	langMenu.className = 'm-2 gap-5 w-full min-w-20 max-w-25 flex-1 bg-[#242424] rounded-xl shadow-lg z-50 text-white border border-green-700';
	langMenu.style.display = 'none';
	langMenu.style.listStyle = 'none';
	langMenu.style.padding = '0';
	langMenu.style.opacity = '0';
	langMenu.style.transform = 'scale(0.92) translateY(-6px)';
	langMenu.style.transformOrigin = 'top';
	langMenu.style.transition = 'opacity 180ms ease, transform 180ms ease';

	const languages = [
		{ code: 'fr', label: 'Français' },
		{ code: 'en', label: 'English' },
		{ code: 'es', label: 'Español' }
	];

	languages.forEach(lang => {
		const li = document.createElement('li');
		li.className = 'text-xs sm:text-lg px-3 py-0.5 sm:py-1 rounded-xl duration-300 hover:scale-101 transition-all hover:bg-green-700 cursor-pointer h-1/3 flex items-center';
		li.textContent = lang.label;
		li.onclick = () => {
			setLanguage(lang.code);
			langMenu.style.display = 'none';
		};
		langMenu.appendChild(li);
	});

	function openMenu() {
		if (langMenu.style.display === 'block') return;
		langMenu.style.display = 'block';
		requestAnimationFrame(() => {
			langMenu.style.opacity = '1';
			langMenu.style.transform = 'scale(1) translateY(0)';
		});
	}

	function closeMenu() {
		if (langMenu.style.display === 'none') return;
		langMenu.style.opacity = '0';
		langMenu.style.transform = 'scale(0.95) translateY(-4px)';
		const onEnd = () => {
			langMenu.removeEventListener('transitionend', onEnd);
			if (langMenu.style.opacity === '0') {
				langMenu.style.display = 'none';
			}
		};
		langMenu.addEventListener('transitionend', onEnd);
	}

	langButton.onclick = (e) => {
		e.stopPropagation();
		if (langMenu.style.display === 'none') openMenu(); else closeMenu();
	};

	document.addEventListener('click', () => closeMenu());

	const langSection = document.createElement("div");
	langSection.className = "p-2 rounded-xl flex items-center justify-center";
	langSection.style.maxWidth = "100%";
	langSection.style.boxSizing = "border-box";
	langSection.appendChild(langButton);
	langSection.appendChild(langMenu);

	return langSection;
}

function PopUpChangeInformation( title: string, maininfo: string, newinfo: string, confnewinfo: string, value: string, onConfirm?: (newValue: string, oldValue?: string) => void ): HTMLElement {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4";

    const close = () => {
      document.removeEventListener("keydown", onEsc);
      overlay.remove();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onEsc);

    const modal = document.createElement("div");
    modal.className = "w-full max-w-md glass-blur text-white rounded-xl p-6";
    overlay.appendChild(modal);

    const Title = document.createElement("h2");
    Title.textContent = title;
    Title.className = "text-xl md:text-2xl mb-4";
    modal.appendChild(Title);

    const InfoContainer = document.createElement("div");
    InfoContainer.className = "flex flex-col gap-3";
    modal.appendChild(InfoContainer);

    const Info = document.createElement("input");
    Info.placeholder = maininfo;
    Info.className = "text-lg md:text-xl rounded-lg border border-white/70 bg-transparent px-3 py-2 focus:scale-102 hover:scale-101 transition-all duration-200";
    Info.maxLength = 25;
	if (maininfo)
		InfoContainer.appendChild(Info);

    const NewInfo = document.createElement("input");
    NewInfo.placeholder = newinfo;
    NewInfo.className = "text-lg md:text-xl rounded-lg border border-white/70 bg-transparent px-3 py-2 focus:scale-102 hover:scale-101 transition-all duration-200";
    NewInfo.maxLength = 30;
    InfoContainer.appendChild(NewInfo);

    const ConfirmNewInfo = document.createElement("input");
    ConfirmNewInfo.placeholder = confnewinfo;
    ConfirmNewInfo.className = "text-lg md:text-xl rounded-lg border border-white/70 bg-transparent px-3 py-2 focus:scale-102 hover:scale-101 transition-all duration-200";
    ConfirmNewInfo.maxLength = 30;
	if (confnewinfo)
    	InfoContainer.appendChild(ConfirmNewInfo);


    const actions = document.createElement("div");
    actions.className = "mt-5 flex justify-end gap-3";
    modal.appendChild(actions);

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "text-xs md:text-base px-4 py-2 rounded-lg border border-white/40 hover:bg-white/10 focus:scale-105 hover:scale-105 transition-all duration-200";
    cancelBtn.textContent = t.cancel;
    cancelBtn.onclick = close;
    actions.appendChild(cancelBtn);

    const BtnConfirm = document.createElement("button");
    BtnConfirm.type = "button";
    BtnConfirm.className = "text-xs md:text-base px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 focus:scale-105 hover:scale-105 transition-all duration-200";
    BtnConfirm.textContent = title;
    actions.appendChild(BtnConfirm);

    BtnConfirm.addEventListener("click", () => {
        let hasErr = false;
        // Only validate current value match if a value was provided
        if (maininfo && value && Info.value !== value) { hasErr = true; Info.classList.add("shake", "placeholder:text-red-500"); }
        if (confnewinfo && newinfo && NewInfo.value !== ConfirmNewInfo.value) { hasErr = true; NewInfo.classList.add("shake","placeholder:text-red-500"); ConfirmNewInfo.classList.add("shake","placeholder:text-red-500"); }
       	if (!hasErr) {
       		onConfirm?.(NewInfo.value, Info.value);
       		close();
       	}
        setTimeout(() => {
          [Info, NewInfo, ConfirmNewInfo].forEach(i => { i.classList.remove("shake","placeholder:text-red-500"); });
        }, 800);
    });
    return overlay;
}

// Helpers to call backend
async function updateProfileInfo(partial: { email?: string; username?: string; avatar?: string }) {
  const token = localStorage.getItem('jwt');
  if (!token) throw new Error('Not authenticated');
  const resp = await fetch('/user/update-info', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(partial)
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data?.error || 'Update failed');
  }
  await ensureUser(true);
}

async function updatePassword(oldPassword: string, newPassword: string) {
  const token = localStorage.getItem('jwt');
  if (!token) throw new Error('Not authenticated');
  const resp = await fetch('/auth/update-password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ oldPassword, newPassword })
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data?.error || 'Password update failed');
  }
}

function CreateFlagSection(lang: string, IconPath: string, code:string): HTMLButtonElement {
    const LangBtn = document.createElement("button");
    LangBtn.className = "p-1 md:p-3 rounded-xl border-1 border-white/30 flex items-center gap-3 transition-all duration-300 hover:bg-white/10 group";

    const LangTxt = document.createElement("p");
    LangTxt.textContent = lang;
    LangTxt.className = "hidden md:flex text-xs md:text-lg tracking-wide transition-transform duration-300 group-hover:scale-105";
    LangBtn.appendChild(LangTxt);

    const LangImg = document.createElement("img");
    LangImg.className = "w-12 h-8 lg:w-15 lg:h-10 rounded-md object-cover flex-none shrink-0 select-none pointer-events-none";
    LangImg.src = IconPath;
    LangBtn.appendChild(LangImg);

    LangBtn.addEventListener(("click"), () => {
        setLanguage(code);
    })

    return (LangBtn);
}

function CreateLine():HTMLElement{
	const line = document.createElement('div');
	line.className = "h-1 w-9/10 lg:w-8/10 ml-auto mr-auto rounded self-stretch bg-white/70 mb-10";
	return (line);
}

export function emitProfileUpdate() {
    window.dispatchEvent(new CustomEvent('profile:update', {
        detail: {
            username,
            avatar: userInventory.avatar?.[0]?.id,
            background: userInventory.background?.[0]?.id,
            bar: userInventory.bar?.[0]?.id,
            ball: userInventory.ball?.[0]?.id
        }
    }));
}

export function SettingsPage(): HTMLElement {
	const mainContainer = document.createElement("div");
	mainContainer.className = "flex flex-col justify-center items-center bg-linear-to-br from-green-500 via-black to-green-800 pt-20 h-screen gap-4";

	const title = document.createElement("h2");
	title.textContent = translations[getCurrentLang()].settings;
	title.className = "fixed text-8xl top-0 p-6 z-1000";
	mainContainer.appendChild(title);

	const settingsContainer = document.createElement("div");
	settingsContainer.className = "rounded-xl flex flex-col pt-2 items-center w-6/10 h-8/10 glass-blur";

	const langSettingsSection = document.createElement("div");
	langSettingsSection.className = "pb-10 pt-10 gap-1 flex justify-around w-full"

	langSettingsSection.appendChild(CreateFlagSection("Français", "/icons/France.svg", "fr"));
	langSettingsSection.appendChild(CreateFlagSection("English", "/icons/United_Kingdom.svg", "en"));
	langSettingsSection.appendChild(CreateFlagSection("Español", "/icons/Spain.svg", "es"));

	const changeInfoSection = document.createElement("div");
	changeInfoSection.className = "mt-5 rounded-xl flex flex-col items-center justify-between w-9/10 sm:w-2/3 gap-15";

	// NAME //

	const changeNameSection = document.createElement("div");
	changeNameSection.className = "rounded-xl flex sm:gap-2 items-center justify-center w-full";

	const Nameimg = document.createElement("img");
	Nameimg.className = "focus hidden sm:flex";
	Nameimg.src = "/icons/user.svg";
	changeNameSection.appendChild(Nameimg);

	const NameContent = document.createElement("p");
	NameContent.textContent = getUser()?.username || "default";
	NameContent.className = "truncate text-auto md:text-xl w-full p-1"
	changeNameSection.appendChild(NameContent);

	const ChangeNameBtn = document.createElement("button");
	ChangeNameBtn.type = "button";
	ChangeNameBtn.className = "flex justify-center items-center p-2 cursor-pointer hover:scale-115 duration-300 transition-all";
	ChangeNameBtn.addEventListener(("click"), () => {
		const overlay = PopUpChangeInformation(t.changeName, "", t.newName, "", getUser()?.username || "default", async (newVal) => {
			try {
				await updateProfileInfo({ username: newVal });
				NameContent.textContent = getUser()?.username || newVal;
				emitProfileUpdate();
			} catch (e: any) {
				alert(e.message || 'Update failed');
			}
		});
		mainContainer.appendChild(overlay);
	});

	const ChangeNameBtnImg = document.createElement("img");
	ChangeNameBtnImg.src = "/icons/pen-line.svg";
	ChangeNameBtnImg.alt = "Edit";
	ChangeNameBtnImg.className = "w-9/10"
	ChangeNameBtn.appendChild(ChangeNameBtnImg);

	changeNameSection.appendChild(ChangeNameBtn);
	changeInfoSection.appendChild(changeNameSection);

	// MAIL //

	const changeMailSection = document.createElement("div");
	changeMailSection.className = "rounded-xl flex sm:gap-2 items-center justify-center w-full";

	const Mailimg = document.createElement("img");
	Mailimg.className = "hidden sm:flex";
	Mailimg.src = "/icons/mail.svg";
	changeMailSection.appendChild(Mailimg);

	const MailContent = document.createElement("p");
	MailContent.textContent = getUser()?.email || "err email";
	MailContent.className = "truncate text-auto md:text-xl w-full p-1"
	changeMailSection.appendChild(MailContent);

	const ChangeMailBtn = document.createElement("button");
	ChangeMailBtn.type = "button";
	ChangeMailBtn.className = "flex justify-center items-center p-2 cursor-pointer hover:scale-115 duration-300 transition-all";
	ChangeMailBtn.addEventListener(("click"), () => {
		const overlay = PopUpChangeInformation(t.changeEmail, t.currentEmail, t.newEmail, t.confirmNewEmail, getUser()?.email || email, async (newVal) => {
			try {
				await updateProfileInfo({ email: newVal });
				MailContent.textContent = getUser()?.email || newVal;
			} catch (e: any) {
				alert(e.message || 'Update failed');
			}
		});
		mainContainer.appendChild(overlay);
	});

 	const ChangeMailBtnImg = document.createElement("img");
 	ChangeMailBtnImg.src = "/icons/pen-line.svg";
 	ChangeMailBtnImg.alt = "Edit";
	ChangeMailBtnImg.className = "w-9/10"
 	ChangeMailBtn.appendChild(ChangeMailBtnImg);

	changeMailSection.appendChild(ChangeMailBtn);
	changeInfoSection.appendChild(changeMailSection);

	// PASSWORD //

	const changePasswordSection = document.createElement("div");
	changePasswordSection.className = "rounded-xl flex sm:gap-2 items-center justify-center w-full";

	const Passwordimg = document.createElement("img");
	Passwordimg.className = "hidden sm:flex";
	Passwordimg.src = "/icons/key-round.svg";
	changePasswordSection.appendChild(Passwordimg);

	const PasswordContent = document.createElement("p");
	PasswordContent.className = "truncate text-auto md:text-xl w-full p-1 select-none";
	const maskPassword = (v: string) => "•".repeat(v.length);
	PasswordContent.textContent = maskPassword(getUser()?.password || password);
	changePasswordSection.appendChild(PasswordContent);

	const ChangePasswordBtn = document.createElement("button");
	ChangePasswordBtn.type = "button";
	ChangePasswordBtn.className = "flex justify-center items-center p-2 cursor-pointer hover:scale-115 duration-300 transition-all";
	ChangePasswordBtn.addEventListener(("click"), () => {
		// Do not validate against stored value; ask user to input current password
		const overlay = PopUpChangeInformation(t.changePassword, t.currentPassword, t.newPassword, t.confirmNewPassword, "", async (newVal, oldVal) => {
			try {
				await updatePassword(oldVal || '', newVal);
				password = newVal;
				PasswordContent.textContent = maskPassword(password);
			} catch (e: any) {
				alert(e.message || 'Password update failed');
			}
		});
		mainContainer.appendChild(overlay);
	});

	const ChangePasswordBtnImg = document.createElement("img");
	ChangePasswordBtnImg.src = "/icons/pen-line.svg";
	ChangePasswordBtnImg.alt = "Edit";
	ChangePasswordBtnImg.className = "w-9/10"
	ChangePasswordBtn.appendChild(ChangePasswordBtnImg);

	changePasswordSection.appendChild(ChangePasswordBtn);
	changeInfoSection.appendChild(changePasswordSection);

	settingsContainer.appendChild(langSettingsSection);
	settingsContainer.appendChild(CreateLine());
	settingsContainer.appendChild(changeInfoSection);
	mainContainer.appendChild(settingsContainer);

	onUserChange(u => { NameContent.textContent = u?.username || "default"; });

	return mainContainer;
}


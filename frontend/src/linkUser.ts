export interface User {
	uuid: string;
	username: string;
	email: string;
	avatar: string | null;
	is_online: number;
	is_a2f?: number;
	games?: string | null;
	game_win?: number;
	game_ratio?: number;
	tournament?: string | null;
	tournament_win?: number;
	tournament_ratio?: number;
}

let cachedUser: User | null = null;
let loading: Promise<User | null> | null = null;
const listeners = new Set<(u: User | null) => void>();

function notify() {
	listeners.forEach(cb => { try { cb(cachedUser); } catch {} });
	window.dispatchEvent(new CustomEvent('user:changed', { detail: cachedUser }));
}

export function onUserChange(cb: (u: User | null) => void): () => void {
	listeners.add(cb);
	cb(cachedUser);
	return () => listeners.delete(cb);
}

export function getUser(): User | null {
	return cachedUser;
}

export async function ensureUser(force = false): Promise<User | null> {
	if (!force && cachedUser) return cachedUser;
	if (loading) return loading;
	const token = localStorage.getItem('jwt');
	if (!token) {
		cachedUser = null;
		notify();
		return null;
	}
	loading = (async () => {
		try {
			const res = await fetch('/user/me', { headers: { Authorization: `Bearer ${token}` } });
			console.log("RES: ",res);
			if (!res.ok) cachedUser = null;
			else {
				const data = await res.json();
				cachedUser = data.user || null;
			}
		} catch {
			cachedUser = null;
		} finally {
			loading = null;
			notify();
			console.log("GETUSER: ", cachedUser); 
			return cachedUser;
		}
	})();
	return loading;
}

export function clearUser() {
	cachedUser = null;
	notify();
}
import type { InvitePayload } from "../pages/friends";

export type Notification = {
	key: string;
	username: string;
	id: string;
	avatar: string;
	message?: string;
	onAccept?: () => void;
	onRefuse?: () => void;
	createdAt: number;
};
export const notifications: Notification[] = [];

export function addNotification(p: InvitePayload): Notification {
	const key = (crypto as any)?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	const n: Notification = { ...p, key, createdAt: Date.now() };
	
	notifications.unshift(n);
	window.dispatchEvent(new Event("notif:changed"));
	return n;
}

export function removeNotification(key: string) {
	const i = notifications.findIndex(n => n.key === key);
	if (i !== -1) {
		notifications.splice(i, 1);
		window.dispatchEvent(new Event("notif:changed"));
	}
}

export function clearNotifications() {
	if (notifications.length) {
		notifications.splice(0, notifications.length);
		window.dispatchEvent(new Event("notif:changed"));
	}
}
import { navigateTo } from "../routes";
import { t } from "../pages/settings";
import { getUser } from "../linkUser";
import { getUidInventory } from "../components/utils";

export type UserNotification = {
	sender_uuid: string;
	reciever_uuid: string;
    uuid: string;
    response: number;
    mode: string;
};

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

export type InvitePayload = {
  	username: string;
  	id: string;
  	avatar: string;
  	message?: string;
  	onAccept?: () => void;
  	onRefuse?: () => void;
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

async function fetchNotifications(): Promise<UserNotification[]> {
    try {
        const token = localStorage.getItem('jwt');
        if (!token) {
            console.error('❌ No JWT token found');
            return [];
        }
        
        const response = await fetch('/user/notifications', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Fetch failed:', response.status, response.statusText, errorText);
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
		console.log('📨 Notifications data received:', data);
        return data.notifications;
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
}

export async function responseInvitation(game_uuid: string, response: number)
{
	console.log("REPONSE INVITATION: ", game_uuid, " |", response);
	try {
        const token = localStorage.getItem('jwt');
		if (!token) return new Error("jwt");
        
        const resp = await fetch(`/user/invit/${encodeURIComponent(game_uuid)}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
			body: JSON.stringify({ response: response })
        });
		console.log(resp);
        if (!resp.ok) {
            console.error("PATCH INVIT RESPONSE: ", resp.status);
            throw new Error('Erreur lors de la récupération');
        }
        const data = await resp.json();
        if (data.mode === "tournament")
			navigateTo(`/Tournament/join?uid=${game_uuid}`);
		else
			navigateTo(`/pong/online/menu?id=${game_uuid}`);
    } catch (error) {
        console.error('Erreur:', error);
    }
}

export async function loadAndDisplayNotifications() {
    try {
        const UserNotifications = await fetchNotifications();
        clearNotifications();
        
		console.log("USER NOTIF :", UserNotifications);
        UserNotifications.forEach(async (notif: UserNotification) => {
            const user = await getUidInventory(notif.sender_uuid);
			console.log("USER IUDUDUDUDIUIDU: ", user);
            if (user instanceof Error) {
                console.error('Error fetching user:', user);
                return;
            }
            addNotification({
                username: `${user.username} ${t.invite}`,
                id: notif.sender_uuid,
                avatar: user.avatar,
                message: `${notif.mode}`,
                onAccept: () => responseInvitation(notif.uuid, 1),
                onRefuse: () => responseInvitation(notif.uuid, 0)
            });
        });
    } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
    }
}
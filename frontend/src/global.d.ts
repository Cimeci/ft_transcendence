// Déclaration pour la propriété personnalisée sur window
interface Window {
    renderPage?: () => void;
    __renderFriends?: () => void;
    __reloadFriends?: () => Promise<void>;
    __renderSearch?: () => void;
    __reloadSearch?: () => Promise<void>;
    __renderRequestsRecieved?: () => void;
    __reloadRequestsRecieved?: () => Promise<void>;
    __renderRequests?: () => void;
    __reloadRequests?: () => Promise<void>;
}

// Déclaration pour l'importation des fichiers CSS
declare module '*.css';

// Déclaration pour la propriété personnalisée sur window
interface Window {
    renderPage?: () => void;
}

// Déclaration pour l'importation des fichiers CSS
declare module '*.css';

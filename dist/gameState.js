export const gameState = {
    cleanupFunction: null,
    registerCleanup(cleanup) {
        this.cleanupFunction = cleanup;
    },
    executeCleanup() {
        if (this.cleanupFunction) {
            this.cleanupFunction();
            this.cleanupFunction = null;
            return true;
        }
        return false;
    }
};

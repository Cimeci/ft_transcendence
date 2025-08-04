export const gameState = {
  cleanupFunction: null as (() => void) | null,
  
  registerCleanup(cleanup: () => void) {
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
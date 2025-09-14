// src/services/storage.ts

interface StorageService {
    get<T>(key: string, defaultValue?: T): Promise<T>;
    set(key: string, value: unknown): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
    onChanged(callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void): void;
}

class ChromeStorageService implements StorageService {
    private isExtensionContext(): boolean {
        return typeof chrome !== 'undefined' &&
            !!chrome.storage &&
            !!chrome.storage.sync;
    }

    async get<T>(key: string, defaultValue?: T): Promise<T> {
        try {
            if (this.isExtensionContext()) {
                return new Promise((resolve) => {
                    chrome.storage.sync.get({ [key]: defaultValue }, (result) => {
                        if (chrome.runtime.lastError) {
                            console.warn('Chrome storage get error:', chrome.runtime.lastError);
                            resolve(this.fallbackGet(key, defaultValue));
                        } else {
                            resolve(result[key] ?? defaultValue);
                        }
                    });
                });
            } else {
                return this.fallbackGet(key, defaultValue);
            }
        } catch (error) {
            console.error('Storage get error:', error);
            return this.fallbackGet(key, defaultValue);
        }
    }

    async set(key: string, value: unknown): Promise<void> {
        try {
            if (this.isExtensionContext()) {
                return new Promise((resolve) => {
                    chrome.storage.sync.set({ [key]: value }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('Chrome storage set error:', chrome.runtime.lastError);
                            this.fallbackSet(key, value);
                            resolve();
                        } else {
                            resolve();
                        }
                    });
                });
            } else {
                return this.fallbackSet(key, value);
            }
        } catch (error) {
            console.error('Storage set error:', error);
            return this.fallbackSet(key, value);
        }
    }

    async remove(key: string): Promise<void> {
        try {
            if (this.isExtensionContext()) {
                return new Promise((resolve) => {
                    chrome.storage.sync.remove(key, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('Chrome storage remove error:', chrome.runtime.lastError);
                            this.fallbackRemove(key);
                        }
                        resolve();
                    });
                });
            } else {
                return this.fallbackRemove(key);
            }
        } catch (error) {
            console.error('Storage remove error:', error);
            return this.fallbackRemove(key);
        }
    }

    async clear(): Promise<void> {
        try {
            if (this.isExtensionContext()) {
                return new Promise((resolve) => {
                    chrome.storage.sync.clear(() => {
                        if (chrome.runtime.lastError) {
                            console.warn('Chrome storage clear error:', chrome.runtime.lastError);
                        }
                        resolve();
                    });
                });
            } else {
                localStorage.clear();
            }
        } catch (error) {
            console.error('Storage clear error:', error);
            localStorage.clear();
        }
    }

    onChanged(callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void): void {
        if (this.isExtensionContext()) {
            chrome.storage.onChanged.addListener((changes, areaName) => {
                if (areaName === 'sync') {
                    callback(changes);
                }
            });
        }
        // Note: localStorage doesn't have native change events across tabs
        // Could implement with storage event listener if needed
    }

    // Fallback methods for localStorage
    private fallbackGet<T>(key: string, defaultValue?: T): T {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : (defaultValue as T);
        } catch (error) {
            console.error('localStorage get error:', error);
            return defaultValue as T;
        }
    }

    private fallbackSet(key: string, value: unknown): Promise<void> {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return Promise.resolve();
        } catch (error) {
            console.error('localStorage set error:', error);
            return Promise.reject(error);
        }
    }

    private fallbackRemove(key: string): Promise<void> {
        try {
            localStorage.removeItem(key);
            return Promise.resolve();
        } catch (error) {
            console.error('localStorage remove error:', error);
            return Promise.reject(error);
        }
    }
}

// Create singleton instance
export const storageService = new ChromeStorageService();

// Export the service class if needed for testing
export { ChromeStorageService };
export type { StorageService };

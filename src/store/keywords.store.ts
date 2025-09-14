import { create } from 'zustand'
import type { KeywordGroup } from '../types/keyword';
import { STORAGE_KEYS } from '../global/constants';
import { storageService } from '../services/storage';

interface KeywordsStore {
    // State
    groups: KeywordGroup[];

    // Actions
    addGroup: (name: string, color: string) => void;
    removeGroup: (groupName: string) => void;
    addKeywordToGroup: (groupName: string, keyword: string) => void;
    removeKeywordFromGroup: (groupName: string, keyword: string) => void;
    loadFromStorage: () => Promise<void>;
    saveToStorage: () => Promise<void>;
}

export const useKeywordsStore = create<KeywordsStore>((set, get) => ({
    // Initial state
    groups: [],

    // Add a new group
    addGroup: (name: string, color: string) => {
        const { groups } = get();

        if (!name.trim()) return;

        // Check if group already exists
        if (groups.some(group => group.name.toLowerCase() === name.toLowerCase())) {
            console.warn(`Group "${name}" already exists`);
            return;
        }

        const newGroup: KeywordGroup = {
            name: name.trim(),
            color: color,
            keywords: []
        };

        set({ groups: [...groups, newGroup] });
        void get().saveToStorage();
    },

    // Remove a group
    removeGroup: (groupName: string) => {
        const { groups } = get();
        set({ groups: groups.filter(group => group.name !== groupName) });
        void get().saveToStorage();
    },

    // Add keyword to specific group
    addKeywordToGroup: (groupName: string, keyword: string) => {
        const { groups } = get();
        keyword = keyword.trim();

        if (!keyword) return;

        const updatedGroups = groups.map(group => {
            if (group.name === groupName) {
                // Check if keyword already exists
                if (group.keywords.some(k => k.toLowerCase() === keyword.toLowerCase())) {
                    console.warn(`Keyword "${keyword}" already exists in group "${groupName}"`);
                    return group;
                }
                return { ...group, keywords: [...group.keywords, keyword.trim()] };
            }
            return group;
        });

        set({ groups: updatedGroups });
        void get().saveToStorage();
    },

    // Remove keyword from specific group
    removeKeywordFromGroup: (groupName: string, keyword: string) => {
        const { groups } = get();

        const updatedGroups = groups.map(group =>
            group.name === groupName
                ? { ...group, keywords: group.keywords.filter(k => k !== keyword) }
                : group
        );

        set({ groups: updatedGroups });
        void get().saveToStorage();
    },

    // Load from storage using storage service
    loadFromStorage: async () => {
        try {
            const groups = await storageService.get<KeywordGroup[]>(STORAGE_KEYS.KEYWORDS, []);
            set({ groups });
        } catch (error) {
            console.error('Failed to load groups from storage:', error);
            set({ groups: [] });
        }
    },

    // Save to storage using storage service
    saveToStorage: async () => {
        try {
            const { groups } = get();
            await storageService.set(STORAGE_KEYS.KEYWORDS, groups);
        } catch (error) {
            console.error('Failed to save groups to storage:', error);
        }
    }
}));

export default useKeywordsStore;
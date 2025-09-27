import { STORAGE_KEYS } from '../global/constants';
import type { KeywordGroup } from '../types/keyword';

/**
 * Service class responsible for highlighting keywords on LinkedIn pages
 * Manages keyword storage, DOM observation, and text highlighting functionality
 */
export class HighlightService {
    private keywords: string[] = [];
    private commonContactsCount: number = 0;
    private observer: MutationObserver | null = null;
    private highlightClassName = 'linkedin-finder-highlight';

    constructor() {
        this.initializeData();
        this.setupKeywordListener();
        this.setupDOMObserver();
    }

    /**
     * Loads keywords and common contacts count from Chrome storage and triggers initial highlighting
     * @returns Promise that resolves when initialization is complete
     */
    private async initializeData(): Promise<void> {
        try {
            // Get keywords
            const result: { [STORAGE_KEYS.KEYWORDS]: KeywordGroup[] } = await chrome.storage.sync.get({ [STORAGE_KEYS.KEYWORDS]: [] });
            const keywordGroups: KeywordGroup[] = result[STORAGE_KEYS.KEYWORDS] || [];
            this.keywords = keywordGroups.flatMap(group => group.keywords);

            // Get common contacts count
            const commonCountResult = await chrome.storage.sync.get({ [STORAGE_KEYS.COMMON_COUNT]: 0 });
            this.commonContactsCount = commonCountResult[STORAGE_KEYS.COMMON_COUNT] || 0;

            this.highlightData();
        } catch (error) {
            console.error('Failed to load keywords:', error);
        }
    }

    /**
     * Sets up a listener for Chrome storage changes to automatically update highlights
     * when keywords or common contacts count are modified from the extension popup
     */
    private setupKeywordListener(): void {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'sync') {
                let shouldUpdate = false;

                if (changes[STORAGE_KEYS.KEYWORDS]) {
                    const keywordGroups: KeywordGroup[] = changes[STORAGE_KEYS.KEYWORDS].newValue || [];
                    this.keywords = keywordGroups.flatMap(group => group.keywords);
                    shouldUpdate = true;
                }

                if (changes[STORAGE_KEYS.COMMON_COUNT]) {
                    this.commonContactsCount = changes[STORAGE_KEYS.COMMON_COUNT].newValue || 0;
                    shouldUpdate = true;
                }

                if (shouldUpdate) {
                    this.clearHighlights();
                    this.highlightData();
                }
            }
        });
    }

    /**
     * Sets up a MutationObserver to watch for DOM changes and re-highlight keywords
     * when new content is added to the page (e.g., dynamic loading on LinkedIn)
     */
    private setupDOMObserver(): void {
        this.observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            shouldUpdate = true;
                        }
                    });
                }
            });

            if (shouldUpdate) {
                // Debounce the highlighting to avoid performance issues
                this.debounceHighlight();
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    private debounceTimer: number | null = null;
    /**
     * Debounces the highlight operation to prevent excessive highlighting calls
     * when rapid DOM changes occur, improving performance
     */
    private debounceHighlight(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = window.setTimeout(() => {
            this.highlightData();
        }, 500);
    }

    /**
     * Main highlighting function that finds all text nodes in the document
     * and applies keyword highlighting to each one
     */
    private highlightData(): void {
        if (this.keywords.length === 0 && this.commonContactsCount === 0) return;

        const textNodes = this.getTextNodes(document.body);

        textNodes.forEach((node) => {
            this.highlightInTextNode(node);
        });
    }

    /**
     * Recursively finds all text nodes in the given element while filtering out
     * unwanted nodes (script, style, already highlighted content)
     * @param element - The root element to search within
     * @returns Array of text nodes that are safe to highlight
     */
    private getTextNodes(element: Element): Text[] {
        const textNodes: Text[] = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip text nodes inside script, style, or already highlighted elements
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;

                    const tagName = parent.tagName.toLowerCase();
                    if (['script', 'style', 'noscript'].includes(tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    if (parent.closest(`.${this.highlightClassName}`)) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let node: Node | null;
        while ((node = walker.nextNode())) {
            textNodes.push(node as Text);
        }

        return textNodes;
    }

    /**
     * Highlights keywords within a specific text node by replacing matched text
     * with HTML spans containing the highlight class
     * @param textNode - The text node to search for keywords and highlight
     */
    private highlightInTextNode(textNode: Text): void {
        if (!textNode.textContent) return;

        let content = textNode.textContent;
        let hasMatch = false;

        // First, check for "y {número} contactos más" pattern
        content = this.highlightContactsPattern(content, (found) => { hasMatch = found; });
        content = this.highlightKeyword(content, (found) => { hasMatch = found; });

        if (hasMatch) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = content;

            // Replace the text node with highlighted content
            const parent: Node | null = textNode.parentNode;
            if (parent) {
                while (wrapper.firstChild) {
                    parent.insertBefore(wrapper.firstChild, textNode);
                }
                parent.removeChild(textNode);
            }
        }
    }

    private highlightKeyword(content: string, setHasMatch: (found: boolean) => void): string {
        if (this.keywords.length === 0) return content;

        // Then, check for regular keywords
        const keywordPattern: string = this.keywords
            .map(keyword => this.escapeRegex(keyword))
            .join('|');

        if (keywordPattern || this.commonContactsCount > 0) {
            const regex: RegExp = new RegExp(`\\b(${keywordPattern})\\b`, 'gi');

            return content.replace(regex, (match: string) => {
                setHasMatch(true);
                return `<span class="${this.highlightClassName} orange">${match}</span>`;
            });
        }

        return content;
    }

    /**
     * Highlights "{número} contactos en común" pattern when the number is >= commonContactsCount
     * @param content - The text content to search in
     * @param setHasMatch - Callback function to indicate if a match was found
     * @returns The content with highlighted contacts pattern if applicable
     */
    private highlightContactsPattern(content: string, setHasMatch: (found: boolean) => void): string {
        if (this.commonContactsCount <= 0) return content;

        // Regex to match "{número} contactos en común" or "{número} contactos más"
        const contactsRegex = /\b(\d+)\s+contactos?\s+(en\s+común|más)/gi;

        return content.replace(contactsRegex, (match: string, numberStr: string) => {
            const contactNumber = parseInt(numberStr, 10);

            // Only highlight if the number is >= commonContactsCount
            if (contactNumber >= this.commonContactsCount) {
                setHasMatch(true);
                return `<span class="${this.highlightClassName} yellow">${match}</span>`;
            }

            return match; // Return original text without highlighting
        });
    }

    /**
     * Escapes special regex characters in a string to ensure literal matching
     * @param string - The string to escape
     * @returns The escaped string safe for use in regex patterns
     */
    private escapeRegex(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Removes all existing highlights from the page by replacing highlighted spans
     * with their original text content
     */
    private clearHighlights(): void {
        const highlightedElements = document.querySelectorAll(`.${this.highlightClassName}`);
        highlightedElements.forEach((element) => {
            const parent = element.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(element.textContent || ''), element);
                parent.normalize();
            }
        });
    }

    /**
     * Cleans up the service by removing highlights, disconnecting observers,
     * and clearing timers. Should be called when the service is no longer needed.
     */
    public destroy(): void {
        this.clearHighlights();
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
}
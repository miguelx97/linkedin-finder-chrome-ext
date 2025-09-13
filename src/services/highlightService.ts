import { STORAGE_KEYS } from '../global/constants';

export class HighlightService {
    private keywords: string[] = [];
    private observer: MutationObserver | null = null;
    private highlightClassName = 'linkedin-finder-highlight';

    constructor() {
        this.initializeKeywords();
        this.setupKeywordListener();
        this.setupDOMObserver();
    }

    private async initializeKeywords(): Promise<void> {
        try {
            const result = await chrome.storage.sync.get({ [STORAGE_KEYS.KEYWORDS]: [] });
            this.keywords = result[STORAGE_KEYS.KEYWORDS] || [];
            this.highlightAllKeywords();
        } catch (error) {
            console.error('Failed to load keywords:', error);
        }
    }

    private setupKeywordListener(): void {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'sync' && changes[STORAGE_KEYS.KEYWORDS]) {
                this.clearHighlights();
                this.keywords = changes[STORAGE_KEYS.KEYWORDS].newValue || [];
                this.highlightAllKeywords();
            }
        });
    }

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
    private debounceHighlight(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = window.setTimeout(() => {
            this.highlightAllKeywords();
        }, 500);
    }

    private highlightAllKeywords(): void {
        if (this.keywords.length === 0) return;

        const textNodes = this.getTextNodes(document.body);

        textNodes.forEach((node) => {
            this.highlightInTextNode(node);
        });
    }

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

    private highlightInTextNode(textNode: Text): void {
        if (!textNode.textContent) return;

        const content = textNode.textContent;
        let hasMatch = false;

        // Create a case-insensitive regex for all keywords
        const keywordPattern = this.keywords
            .map(keyword => this.escapeRegex(keyword))
            .join('|');

        if (!keywordPattern) return;

        const regex = new RegExp(`\\b(${keywordPattern})\\b`, 'gi');

        const highlightedContent = content.replace(regex, (match) => {
            hasMatch = true;
            return `<span class="${this.highlightClassName}">${match}</span>`;
        });

        if (hasMatch) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = highlightedContent;

            // Replace the text node with highlighted content
            const parent = textNode.parentNode;
            if (parent) {
                while (wrapper.firstChild) {
                    parent.insertBefore(wrapper.firstChild, textNode);
                }
                parent.removeChild(textNode);
            }
        }
    }

    private escapeRegex(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

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
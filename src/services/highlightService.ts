import { STORAGE_KEYS } from '../global/constants';

export class HighlightService {
    private keywords: string[] = [];
    constructor() {
        // this.test();
        this.initializeKeywords();
    }

    private async initializeKeywords() {
        const result = await chrome.storage.sync.get({ [STORAGE_KEYS.KEYWORDS]: [] });
        this.keywords = result[STORAGE_KEYS.KEYWORDS] || [];
        console.log('Keywords encontradas:', this.keywords);
    }

    // private async test() {
    //     console.log('HighlightService iniciado en LinkedIn!');

    //     try {
    //         const result = await chrome.storage.sync.get({ [STORAGE_KEYS.KEYWORDS]: [] });
    //         const keywords = result[STORAGE_KEYS.KEYWORDS] || [];
    //         console.log('Keywords encontradas:', keywords);

    //         // Mostrar una alerta temporal para confirmar que funciona
    //         if (keywords.length > 0) {
    //             alert(`LinkedIn Finder activo! Keywords: ${keywords.join(', ')}`);
    //         } else {
    //             alert('LinkedIn Finder activo! No hay keywords configuradas.');
    //         }
    //     } catch (error) {
    //         console.error('Error al cargar keywords:', error);
    //     }
    // }
}
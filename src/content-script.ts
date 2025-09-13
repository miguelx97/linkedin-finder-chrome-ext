import { HighlightService } from './services/highlightService';

console.log('LinkedIn Finder content script loaded');

// Inicializar el servicio cuando la página esté lista
let highlightService: HighlightService | null = null;

function initializeService() {
    if (highlightService) {
        return; // Ya está inicializado
    }

    console.log('Initializing highlight service...');
    highlightService = new HighlightService();
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeService);
} else {
    initializeService();
}

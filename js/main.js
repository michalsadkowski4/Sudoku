// js/main.js
import { initializeEventListeners } from './events.js';
import { setupNumberSelector, loadTheme, renderEmptyBoard, initCookieConsent } from './ui.js';
import { handleNumberInput } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    setupNumberSelector(handleNumberInput); 
    initializeEventListeners();
    // Renderuj pustą planszę zamiast rozpoczynać grę
    renderEmptyBoard();
    // --- DODANA INICJALIZACJA ---
    initCookieConsent();
});
// js/main.js
import { initializeEventListeners } from './events.js';
import { setupNumberSelector, loadTheme } from './ui.js';
import { startNewGame, handleNumberInput } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    // Przekazanie funkcji `handleNumberInput` do konfiguratora przycisków
    setupNumberSelector(handleNumberInput); 
    initializeEventListeners();
    startNewGame(); // Automatyczne rozpoczęcie pierwszej gry
});
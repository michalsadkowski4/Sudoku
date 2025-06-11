// js/events.js
import * as ui from './ui.js';
import * as game from './game.js';
import * as state from './state.js';

export function initializeEventListeners() {
    const staticDom = {
        newGameBtn: document.getElementById('newGameBtn'),
        resetBoardBtn: document.getElementById('resetBoardBtn'),
        checkErrorsBtn: document.getElementById('checkErrorsBtn'),
        themeToggleBtn: document.getElementById('themeToggleBtn'),
    };

    // Logika dla przycisków Nowa Gra i Reset z użyciem nowego modala
    staticDom.newGameBtn.addEventListener('click', () => {
        ui.showConfirmModal(
            'Czy na pewno chcesz rozpocząć nową grę? Postępy zostaną utracone.',
            game.startNewGame
        );
    });

    staticDom.resetBoardBtn.addEventListener('click', () => {
        ui.showConfirmModal(
            'Czy na pewno chcesz zresetować planszę do stanu początkowego?',
            game.resetBoard
        );
    });

    staticDom.checkErrorsBtn.addEventListener('click', game.performErrorCheck);
    staticDom.themeToggleBtn.addEventListener('click', ui.handleThemeToggle);

    // Przełączniki trybów
    ui.dom.numberModeBtn.addEventListener('click', () => {
        state.setMode('number');
        ui.updateModeButtons();
    });
    ui.dom.notesModeBtn.addEventListener('click', () => {
        state.setMode('notes');
        ui.updateModeButtons();
    });
    ui.dom.eraseModeBtn.addEventListener('click', () => {
        state.setMode('erase');
        ui.updateModeButtons();
        game.handleErase();
    });
    ui.dom.autoNotesToggleBtn.addEventListener('click', game.toggleAutoNotes);
    
    // Interakcja z planszą
    ui.dom.sudokuGrid.addEventListener('click', (event) => {
        const cell = event.target.closest('div[data-row]');
        if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            game.handleCellClick(row, col);
        }
    });

    // Interakcja z panelem wyboru numerów
    ui.dom.numberSelector.addEventListener('click', (event) => {
        const button = event.target.closest('.num-selector-btn');
        if(button && button.dataset.number) {
            const num = parseInt(button.dataset.number);
            state.setHighlightedNumber(state.getGameState().highlightedNumber === num ? 0 : num);
            ui.renderBoard();
        }
    });

    // Listenery dla nowego modala potwierdzającego
    ui.dom.confirmYesBtn.addEventListener('click', () => {
        const action = state.getGameState().onConfirmAction;
        if (typeof action === 'function') {
            action();
        }
        ui.hideConfirmModal();
    });

    ui.dom.confirmNoBtn.addEventListener('click', ui.hideConfirmModal);

    // Listener dla modala wygranej
    ui.dom.closeWinModalBtn.addEventListener('click', ui.hideWinModal);
    
    // Interakcja z klawiaturą
    document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(event) {
    const gameState = state.getGameState();
    if (gameState.selectedCell.row === -1) return;

    const { row, col } = gameState.selectedCell;
    let newRow = row, newCol = col;

    if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        if (event.key === 'ArrowUp') newRow = Math.max(0, row - 1);
        else if (event.key === 'ArrowDown') newRow = Math.min(8, row + 1);
        else if (event.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
        else if (event.key === 'ArrowRight') newCol = Math.min(8, col + 1);
        
        game.handleCellClick(newRow, newCol);
        return;
    }

    if (gameState.initialSudokuBoard[row] && gameState.initialSudokuBoard[row][col] !== 0) return;

    const num = parseInt(event.key);
    if (num >= 1 && num <= 9) {
        event.preventDefault();
        game.handleNumberInput(num);
    } else if (event.key === 'Delete' || event.key === 'Backspace' || event.key === '0') {
        event.preventDefault();
        game.handleErase();
    }
}
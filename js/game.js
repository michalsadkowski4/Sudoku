// js/game.js
import { generateSudoku } from './boardGenerator.js';
import { getErrors } from './utils.js';
import * as state from './state.js';
import * as ui from './ui.js';
import { calculateAndSetAutoNotes } from './autoNotes.js';

export function startNewGame() {
    const difficulty = ui.dom.difficultySelect.value;
    const newBoard = generateSudoku(difficulty);
    
    state.setInitialBoards(newBoard);
    state.setSelectedCell(-1, -1);
    state.setHighlightedNumber(0);
    state.setAutoNotesActive(false);
    state.setErrors([]);
    
    ui.renderBoard();
    ui.updateAutoNotesButton();
}

export function resetBoard() {
    if (confirm('Czy na pewno chcesz zresetować planszę do stanu początkowego?')) {
        state.resetCurrentBoard();
        state.setHighlightedNumber(0);
        state.setAutoNotesActive(false);
        ui.updateAutoNotesButton();
        ui.renderBoard();
    }
}

export function handleCellClick(row, col) {
    const gameState = state.getGameState();
    const clickedNumber = gameState.currentSudokuBoard[row][col];

    if (clickedNumber !== 0) {
        state.setHighlightedNumber(gameState.highlightedNumber === clickedNumber ? 0 : clickedNumber);
    } else {
        state.setHighlightedNumber(0);
    }
    
    state.setSelectedCell(row, col);
    ui.renderBoard();
}

export function handleNumberInput(num) {
    const { selectedCell, currentMode, isAutoNotesModeActive, initialSudokuBoard } = state.getGameState();
    const { row, col } = selectedCell;

    if (row === -1 || (initialSudokuBoard[row] && initialSudokuBoard[row][col] !== 0)) {
        return;
    }

    state.clearErrorForCell(row, col);

    if (currentMode === 'number') {
        state.updateCell(row, col, num);
    } else if (currentMode === 'notes') {
        state.updateNotes(row, col, num);
    }
    
    if (isAutoNotesModeActive) {
        calculateAndSetAutoNotes();
    } else {
        ui.renderBoard();
    }
}

export function handleErase() {
    const { selectedCell, isAutoNotesModeActive, initialSudokuBoard } = state.getGameState();
    const { row, col } = selectedCell;

    if (row === -1 || (initialSudokuBoard[row] && initialSudokuBoard[row][col] !== 0)) {
        return;
    }
    
    state.clearErrorForCell(row, col);
    state.clearCell(row, col);
    
    if (isAutoNotesModeActive) {
        calculateAndSetAutoNotes();
    } else {
        ui.renderBoard();
    }
}

export function performErrorCheck() {
    const { currentSudokuBoard, initialSudokuBoard } = state.getGameState();
    const errors = getErrors(currentSudokuBoard, initialSudokuBoard);
    state.setErrors(errors);
    ui.renderBoard();
    
    if (errors.length === 0) {
        alert("Brak błędów na planszy!");
    } else {
        alert(`Znaleziono ${errors.length} błędnych komórek.`);
    }
}

export function toggleAutoNotes() {
    const { isAutoNotesModeActive } = state.getGameState();
    state.setAutoNotesActive(!isAutoNotesModeActive);
    
    if (state.getGameState().isAutoNotesModeActive) {
        calculateAndSetAutoNotes();
    }
    
    ui.updateAutoNotesButton();
    ui.renderBoard();
}
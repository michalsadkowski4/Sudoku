// js/state.js
import { deepCopy } from './utils.js';

const state = {
    currentSudokuBoard: [],
    initialSudokuBoard: [],
    currentNotes: [],
    selectedCell: { row: -1, col: -1 },
    currentMode: 'number', // 'number', 'notes', 'erase'
    currentErrors: [],
    isAutoNotesModeActive: false,
    highlightedNumber: 0,
    // Nowe zmienne dla zegara
    timerInterval: null,
    elapsedSeconds: 0,
};

export function getGameState() {
    return state;
}

export function setInitialBoards(board) {
    state.initialSudokuBoard = deepCopy(board);
    state.currentSudokuBoard = deepCopy(board);
    state.currentNotes = Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
}

export function resetCurrentBoard() {
    state.currentSudokuBoard = deepCopy(state.initialSudokuBoard);
    state.currentNotes = Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
    state.currentErrors = [];
    state.isAutoNotesModeActive = false;
}

export function updateCell(row, col, value) {
    if (state.initialSudokuBoard[row][col] === 0) {
        state.currentSudokuBoard[row][col] = value;
        state.currentNotes[row][col].clear();
    }
}

export function updateNotes(row, col, value) {
     if (state.initialSudokuBoard[row][col] === 0) {
        const notes = state.currentNotes[row][col];
        if (notes.has(value)) {
            notes.delete(value);
        } else {
            notes.add(value);
        }
        state.currentSudokuBoard[row][col] = 0;
    }
}

export function clearCell(row, col) {
     if (state.initialSudokuBoard[row][col] === 0) {
        state.currentSudokuBoard[row][col] = 0;
        state.currentNotes[row][col].clear();
    }
}

export function setSelectedCell(row, col) {
    state.selectedCell = { row, col };
}

export function setMode(mode) {
    state.currentMode = mode;
}

export function setErrors(errors) {
    state.currentErrors = errors;
}

export function clearErrorForCell(row, col) {
    state.currentErrors = state.currentErrors.filter(err => err.row !== row || err.col !== col);
}

export function setAutoNotesActive(isActive) {
    state.isAutoNotesModeActive = isActive;
}

export function setAllNotes(notes) {
    state.currentNotes = notes;
}

export function setHighlightedNumber(num) {
    state.highlightedNumber = num;
}

// Nowe funkcje do zarządzania stanem zegara
export function setTimerInterval(intervalId) {
    state.timerInterval = intervalId;
}

export function clearTimerInterval() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

export function setElapsedSeconds(seconds) {
    state.elapsedSeconds = seconds;
}
// js/game.js
import { generateSudoku } from './boardGenerator.js';
import { getErrors } from './utils.js';
import * as state from './state.js';
import * as ui from './ui.js';
import { calculateAndSetAutoNotes } from './autoNotes.js';

// --- LOGIKA ZEGARA ---
function startTimer() {
    state.clearTimerInterval();
    state.setElapsedSeconds(0);
    ui.updateTimerDisplay(0);

    const intervalId = setInterval(() => {
        const newTime = state.getGameState().elapsedSeconds + 1;
        state.setElapsedSeconds(newTime);
        ui.updateTimerDisplay(newTime);
    }, 1000);
    state.setTimerInterval(intervalId);
}

function stopTimer() {
    state.clearTimerInterval();
}

// --- LOGIKA WYGRANEJ ---
function checkWinCondition() {
    const { currentSudokuBoard } = state.getGameState();
    
    // Sprawdź, czy plansza jest pełna
    const isFull = !currentSudokuBoard.some(row => row.includes(0));
    if (!isFull) {
        return; // Jeśli nie jest pełna, nie ma wygranej
    }

    // Jeśli jest pełna, sprawdź błędy
    const errors = getErrors(currentSudokuBoard, state.getGameState().initialSudokuBoard);
    if (errors.length === 0) {
        handleWin();
    }
}

function handleWin() {
    stopTimer();
    const { elapsedSeconds } = state.getGameState();
    const difficultyMap = {
        easy: 'Łatwy',
        medium: 'Średni',
        hard: 'Trudny',
        veryHard: 'Bardzo Trudny'
    };
    const difficulty = difficultyMap[ui.dom.difficultySelect.value] || 'Niestandardowy';
    const time = ui.formatTime(elapsedSeconds);
    
    ui.showWinModal(difficulty, time);
}

// --- GŁÓWNE FUNKCJE GRY ---
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
    startTimer();
}

export function resetBoard() {
    if (confirm('Czy na pewno chcesz zresetować planszę do stanu początkowego?')) {
        state.resetCurrentBoard();
        state.setHighlightedNumber(0);
        state.setAutoNotesActive(false);
        ui.updateAutoNotesButton();
        ui.renderBoard();
        stopTimer();
        ui.updateTimerDisplay(0);
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

    // Po każdej wstawionej liczbie sprawdź warunek wygranej
    if (currentMode === 'number') {
        checkWinCondition();
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

export function toggleAutoNotes() {
    const { isAutoNotesModeActive } = state.getGameState();
    state.setAutoNotesActive(!isAutoNotesModeActive);
    
    if (state.getGameState().isAutoNotesModeActive) {
        calculateAndSetAutoNotes();
    }
    
    ui.updateAutoNotesButton();
    ui.renderBoard();
}
// js/game.js
import { generateSudoku } from './boardGenerator.js';
import { getErrors } from './utils.js';
import * as state from './state.js';
import * as ui from './ui.js';
import { calculateAndSetAutoNotes } from './autoNotes.js';
// --- DODANY IMPORT ---
import * as cookies from './cookies.js';

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
    
    const isFull = !currentSudokuBoard.some(row => row.includes(0));
    if (!isFull) {
        return;
    }

    const errors = getErrors(currentSudokuBoard, state.getGameState().initialSudokuBoard);
    if (errors.length === 0) {
        handleWin();
    }
}

function handleWin() {
    stopTimer();
    const { elapsedSeconds } = state.getGameState();
    const difficultyValue = ui.dom.difficultySelect.value;
    const difficultyMap = {
        easy: 'Łatwy',
        medium: 'Średni',
        hard: 'Trudny',
        veryHard: 'Bardzo Trudny'
    };
    const difficulty = difficultyMap[difficultyValue] || 'Niestandardowy';
    const time = ui.formatTime(elapsedSeconds);

    // --- ZAPIS WYNIKU DO CIASTECZEK ---
    if (cookies.getCookie('cookie_consent') === 'true') {
        const winData = {
            date: new Date().toISOString(),
            difficulty: difficultyValue,
            time: elapsedSeconds
        };
        cookies.saveWin(winData);
    }
    
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
    state.resetCurrentBoard();
    state.setHighlightedNumber(0);
    state.setAutoNotesActive(false);
    ui.updateAutoNotesButton();
    ui.renderBoard();
    stopTimer();
    ui.updateTimerDisplay(0);
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
        state.setHighlightedNumber(num);
    } else if (currentMode === 'notes') {
        state.updateNotes(row, col, num);
    }
    
    if (isAutoNotesModeActive) {
        calculateAndSetAutoNotes();
    } else {
        ui.renderBoard();
    }

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

export function performErrorCheck() {
    const { currentSudokuBoard, initialSudokuBoard } = state.getGameState();

    if (initialSudokuBoard.length === 0) {
        alert("Rozpocznij nową grę, aby sprawdzić błędy.");
        return;
    }

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
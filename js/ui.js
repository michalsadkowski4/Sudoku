// js/ui.js
import { getGameState } from './state.js';

export const dom = {
    sudokuGrid: document.getElementById('sudokuGrid'),
    numberSelector: document.getElementById('numberSelector'),
    numberModeBtn: document.getElementById('numberModeBtn'),
    notesModeBtn: document.getElementById('notesModeBtn'),
    eraseModeBtn: document.getElementById('eraseModeBtn'),
    autoNotesToggleBtn: document.getElementById('autoNotesCheatBtn'),
    difficultySelect: document.getElementById('difficultySelect'),
    body: document.body
};

export function setupNumberSelector(handler) {
    dom.numberSelector.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        const numBtn = document.createElement('button');
        numBtn.textContent = i;
        numBtn.classList.add('num-selector-btn');
        numBtn.dataset.number = i;
        numBtn.addEventListener('click', () => handler(i));
        dom.numberSelector.appendChild(numBtn);
    }
}

export function renderBoard() {
    const { currentSudokuBoard, initialSudokuBoard, currentNotes, selectedCell, currentErrors, highlightedNumber } = getGameState();

    if (dom.sudokuGrid.children.length === 0) {
        dom.sudokuGrid.innerHTML = '';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.dataset.row = r;
                cell.dataset.col = c;
                dom.sudokuGrid.appendChild(cell);
            }
        }
    }

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = dom.sudokuGrid.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (!cell) continue;

            const currentNumber = currentSudokuBoard[r][c];
            const isInitial = initialSudokuBoard[r][c] !== 0;
            const currentCellNotes = currentNotes[r][c];

            cell.textContent = '';
            cell.classList.remove('cell-initial', 'cell-selected', 'cell-error', 'cell-highlighted-number');
            
            let existingNotesContainer = cell.querySelector('.cell-notes');
            if (existingNotesContainer) existingNotesContainer.remove();

            if (isInitial) {
                cell.textContent = currentNumber;
                cell.classList.add('cell-initial');
            } else if (currentNumber !== 0) {
                cell.textContent = currentNumber;
            } else {
                if (currentCellNotes && currentCellNotes.size > 0) {
                    const notesContainer = document.createElement('div');
                    notesContainer.classList.add('cell-notes');
                    notesContainer.textContent = Array.from(currentCellNotes).sort((a, b) => a - b).join('');
                    cell.appendChild(notesContainer);
                }
            }
            
            cell.classList.toggle('cell-selected', selectedCell.row === r && selectedCell.col === c);
            cell.classList.toggle('cell-error', !isInitial && currentErrors.some(err => err.row === r && err.col === c));

            const shouldHighlight = (currentNumber !== 0 && currentNumber === highlightedNumber) || 
                                    (currentNumber === 0 && currentCellNotes && currentCellNotes.has(highlightedNumber));
            cell.classList.toggle('cell-highlighted-number', shouldHighlight);
        }
    }
}

export function updateModeButtons() {
    const { currentMode } = getGameState();
    dom.numberModeBtn.classList.toggle('active', currentMode === 'number');
    dom.notesModeBtn.classList.toggle('active', currentMode === 'notes');
    dom.eraseModeBtn.classList.toggle('active', currentMode === 'erase');
}

export function updateAutoNotesButton() {
    const { isAutoNotesModeActive } = getGameState();
    dom.autoNotesToggleBtn.classList.toggle('active', isAutoNotesModeActive);
    dom.autoNotesToggleBtn.textContent = `Auto Notatki: ${isAutoNotesModeActive ? 'WŁ.' : 'WYŁ.'}`;
}

export function handleThemeToggle() {
    if (dom.body.classList.contains('dark-theme')) {
        dom.body.classList.remove('dark-theme');
        dom.body.classList.add('light-theme');
        localStorage.setItem('sudokuTheme', 'light-theme');
    } else {
        dom.body.classList.remove('light-theme');
        dom.body.classList.add('dark-theme');
        localStorage.setItem('sudokuTheme', 'dark-theme');
    }
}

export function loadTheme() {
    const savedTheme = localStorage.getItem('sudokuTheme') || 'light-theme';
    dom.body.classList.add(savedTheme);
}
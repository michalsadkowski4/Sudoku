// js/ui.js
import { getGameState, setOnConfirmAction } from './state.js';
import * as cookies from './cookies.js';

export const dom = {
    sudokuGrid: document.getElementById('sudokuGrid'),
    numberSelector: document.getElementById('numberSelector'),
    numberModeBtn: document.getElementById('numberModeBtn'),
    notesModeBtn: document.getElementById('notesModeBtn'),
    eraseModeBtn: document.getElementById('eraseModeBtn'),
    autoNotesToggleBtn: document.getElementById('autoNotesCheatBtn'),
    difficultySelect: document.getElementById('difficultySelect'),
    body: document.body,
    timer: document.getElementById('timer'),
    // Elementy modala wygranej
    winModal: document.getElementById('winModal'),
    winDifficulty: document.getElementById('winDifficulty'),
    winTime: document.getElementById('winTime'),
    closeWinModalBtn: document.getElementById('closeWinModalBtn'),
    // Elementy modala potwierdzającego
    confirmModal: document.getElementById('confirmModal'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmYesBtn: document.getElementById('confirmYesBtn'),
    confirmNoBtn: document.getElementById('confirmNoBtn'),
    // --- NOWE ELEMENTY DOM ---
    showScoresBtn: document.getElementById('showScoresBtn'),
    scoresModal: document.getElementById('scoresModal'),
    scoresTableContainer: document.getElementById('scoresTableContainer'),
    closeScoresModalBtn: document.getElementById('closeScoresModalBtn'),
    cookieConsentBanner: document.getElementById('cookieConsentBanner'),
    acceptCookiesBtn: document.getElementById('acceptCookiesBtn'),
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

export function renderEmptyBoard() {
    dom.sudokuGrid.innerHTML = '';
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.dataset.row = r;
            cell.dataset.col = c;
            dom.sudokuGrid.appendChild(cell);
        }
    }
    updateTimerDisplay(0);
}

export function renderBoard() {
    const { currentSudokuBoard, initialSudokuBoard, currentNotes, selectedCell, currentErrors, highlightedNumber } = getGameState();

    if (dom.sudokuGrid.children.length === 0 || !dom.sudokuGrid.querySelector('[data-row="0"]')) {
        renderEmptyBoard();
    }

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = dom.sudokuGrid.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (!cell) continue;

            const currentNumber = currentSudokuBoard[r][c] || 0;
            const isInitial = initialSudokuBoard.length > 0 && initialSudokuBoard[r][c] !== 0;
            const currentCellNotes = currentNotes.length > 0 ? currentNotes[r][c] : new Set();

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

export function showConfirmModal(message, action) {
    dom.confirmMessage.textContent = message;
    setOnConfirmAction(action);
    dom.confirmModal.classList.add('show');
}

export function hideConfirmModal() {
    dom.confirmModal.classList.remove('show');
    setOnConfirmAction(() => {});
}

export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function updateTimerDisplay(seconds) {
    dom.timer.textContent = formatTime(seconds);
}

export function showWinModal(difficulty, time) {
    dom.winDifficulty.textContent = difficulty;
    dom.winTime.textContent = time;
    dom.winModal.classList.add('show');
}

export function hideWinModal() {
    dom.winModal.classList.remove('show');
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

// --- NOWE FUNKCJE DLA WYNIKÓW I COOKIES ---

/**
 * Pokazuje modal z najlepszymi wynikami.
 */
export function showScoresModal() {
    const wins = cookies.getWins();
    const difficultyMap = { easy: 1, medium: 2, hard: 3, veryHard: 4 };
    const difficultyLabels = { easy: 'Łatwy', medium: 'Średni', hard: 'Trudny', veryHard: 'Bardzo Trudny' };

    // Sortowanie: najpierw po poziomie trudności, potem po czasie
    wins.sort((a, b) => {
        const diffA = difficultyMap[a.difficulty] || 0;
        const diffB = difficultyMap[b.difficulty] || 0;
        if (diffA !== diffB) {
            return diffA - diffB;
        }
        return a.time - b.time;
    });

    if (wins.length === 0) {
        dom.scoresTableContainer.innerHTML = "<p>Brak zapisanych wyników.</p>";
    } else {
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Poziom</th>
                        <th>Czas</th>
                    </tr>
                </thead>
                <tbody>
        `;
        wins.forEach(win => {
            const date = new Date(win.date).toLocaleString('pl-PL');
            const difficulty = difficultyLabels[win.difficulty] || win.difficulty;
            const time = formatTime(win.time);
            tableHTML += `
                <tr>
                    <td>${date}</td>
                    <td>${difficulty}</td>
                    <td>${time}</td>
                </tr>
            `;
        });
        tableHTML += `</tbody></table>`;
        dom.scoresTableContainer.innerHTML = tableHTML;
    }

    dom.scoresModal.classList.add('show');
}

export function hideScoresModal() {
    dom.scoresModal.classList.remove('show');
}

/**
 * Inicjalizuje baner cookies.
 */
export function initCookieConsent() {
    if (cookies.getCookie('cookie_consent') !== 'true') {
        dom.cookieConsentBanner.style.display = 'flex';
    }
}
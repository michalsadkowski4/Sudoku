// js/autoNotes.js
import { getGameState, setAllNotes } from './state.js';
import { getPossibleCandidatesForCell } from './utils.js';
import { renderBoard } from './ui.js';

export function calculateAndSetAutoNotes() {
    const { currentSudokuBoard, initialSudokuBoard } = getGameState();
    const newNotes = Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (currentSudokuBoard[r][c] === 0 && initialSudokuBoard[r][c] === 0) {
                const candidates = getPossibleCandidatesForCell(currentSudokuBoard, r, c);
                candidates.forEach(num => newNotes[r][c].add(num));
            }
        }
    }
    setAllNotes(newNotes);
    renderBoard();
}
// js/boardGenerator.js

import { deepCopy, isValidMove, findEmpty, shuffleArray } from './utils.js';

/**
 * Uzupełnia pustą planszę Sudoku rekurencyjnie (backtracking).
 * Używane do generowania pełnej, poprawnej planszy.
 * @param {Array<Array<number>>} board - plansza Sudoku (0 dla pustych komórek).
 * @returns {boolean} true, jeśli plansza została poprawnie wypełniona; false w przeciwnym razie.
 */
function fillBoard(board) {
    const find = findEmpty(board);
    if (!find) {
        return true; // Plansza jest pełna
    }

    const [row, col] = find;
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]); // Tasuj liczby, aby uzyskać różne rozwiązania

    for (const num of numbers) {
        if (isValidMove(board, row, col, num)) {
            board[row][col] = num;

            if (fillBoard(board)) {
                return true;
            }

            board[row][col] = 0; // Cofnij ruch, jeśli nie prowadzi do rozwiązania
        }
    }
    return false; // Nie znaleziono liczby dla tej komórki
}

/**
 * Zlicza liczbę rozwiązań danej planszy Sudoku.
 * Używane do upewnienia się, że plansza ma unikalne rozwiązanie.
 * @param {Array<Array<number>>} board - plansza Sudoku.
 * @returns {number} liczba możliwych rozwiązań.
 */
function countSolutions(board) {
    let solutions = 0;
    const tempBoard = deepCopy(board); // Pracujemy na kopii

    function solve(currentBoard) {
        if (solutions > 1) return; // Przerywamy, jeśli znaleźliśmy więcej niż jedno rozwiązanie

        const find = findEmpty(currentBoard);
        if (!find) {
            solutions++;
            return;
        }

        const [row, col] = find;
        for (let num = 1; num <= 9; num++) {
            if (isValidMove(currentBoard, row, col, num)) {
                currentBoard[row][col] = num;
                solve(currentBoard);
                currentBoard[row][col] = 0; // Cofnij ruch
            }
        }
    }

    solve(tempBoard);
    return solutions;
}


/**
 * Generuje nową planszę Sudoku o określonym poziomie trudności.
 * Poziomy trudności są na razie bazowane na liczbie usuniętych komórek.
 * @param {string} difficulty - "easy", "medium", "hard", "veryHard".
 * @returns {Array<Array<number>>} wygenerowana plansza Sudoku.
 */
export function generateSudoku(difficulty) {
    let emptyCellsCount; // Ile komórek ma być pustych

    switch (difficulty) {
        case 'easy':
            emptyCellsCount = 35; // Około 46 liczb
            break;
        case 'medium':
            emptyCellsCount = 45; // Około 36 liczb
            break;
        case 'hard':
            emptyCellsCount = 55; // Około 26 liczb
            break;
        case 'veryHard':
            emptyCellsCount = 60; // Około 21 liczb - może być bardzo trudne, ale to tylko wstępna wartość
            break;
        default:
            emptyCellsCount = 40; // Domyślnie
    }

    // Krok 1: Wygeneruj pełną, poprawną planszę
    const fullBoard = Array(9).fill(0).map(() => Array(9).fill(0));
    fillBoard(fullBoard);

    const puzzleBoard = deepCopy(fullBoard);
    let cellsToRemove = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            cellsToRemove.push({ r, c });
        }
    }
    shuffleArray(cellsToRemove); // Tasuj kolejność usuwania komórek

    let removedCount = 0;
    while (removedCount < emptyCellsCount && cellsToRemove.length > 0) {
        const { r, c } = cellsToRemove.pop(); // Usuń komórkę z końca potasowanej listy

        const tempValue = puzzleBoard[r][c];
        puzzleBoard[r][c] = 0; // Usuń cyfrę

        // Na razie NIE sprawdzamy, czy plansza ma unikalne rozwiązanie ani czy jest rozwiązywalna ludzkimi metodami.
        // To będzie dodane później, gdy będziemy mieli zaimplementowane metody rozwiązywania.
        // if (countSolutions(puzzleBoard) !== 1) {
        //     puzzleBoard[r][c] = tempValue; // Przywróć cyfrę, jeśli rozwiązanie nie jest unikalne
        // } else {
        //     removedCount++;
        // }

        // Póki co, po prostu usuwamy, ignorując unikalność. Zmienimy to w dalszej fazie.
        removedCount++;
    }
    
    return puzzleBoard;
}
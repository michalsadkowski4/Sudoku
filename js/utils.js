// js/utils.js

/**
 * Tworzy głęboką kopię tablicy 2D (np. planszy Sudoku).
 * Ważne, aby nie modyfikować oryginalnej planszy podczas operacji pomocniczych.
 * @param {Array<Array<number>>} board - tablica 2D do skopiowania.
 * @returns {Array<Array<number>>} głęboka kopia tablicy.
 */
export function deepCopy(board) {
    return board.map(row => [...row]);
}

/**
 * Sprawdza, czy liczba jest poprawna w danej komórce, zgodnie z zasadami Sudoku (w rzędzie, kolumnie i bloku 3x3).
 * Zakłada, że board zawiera 0 dla pustych komórek.
 * @param {Array<Array<number>>} board - aktualna plansza Sudoku.
 * @param {number} row - indeks wiersza (0-8).
 * @param {number} col - indeks kolumny (0-8).
 * @param {number} num - liczba do sprawdzenia (1-9).
 * @returns {boolean} true, jeśli liczba jest poprawna; false w przeciwnym razie.
 */
export function isValidMove(board, row, col, num) {
    // Sprawdź wiersz
    for (let x = 0; x < 9; x++) {
        // Poprawka: nie sprawdzaj liczby z nią samą, jeśli jest na miejscu [row][col]
        if (x !== col && board[row][x] === num) {
            return false;
        }
    }

    // Sprawdź kolumnę
    for (let x = 0; x < 9; x++) {
        // Poprawka: nie sprawdzaj liczby z nią samą
        if (x !== row && board[x][col] === num) {
            return false;
        }
    }

    // Sprawdź blok 3x3
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const currRow = i + startRow;
            const currCol = j + startCol;
            // Poprawka: nie sprawdzaj liczby z nią samą
            if (currRow !== row || currCol !== col) {
                if (board[currRow][currCol] === num) {
                    return false;
                }
            }
        }
    }

    return true;
}

/**
 * Znajduje pierwszą pustą komórkę (oznaczoną jako 0) na planszy.
 * @param {Array<Array<number>>} board - plansza Sudoku.
 * @returns {Array<number>|null} tablica [row, col] pustej komórki lub null, jeśli plansza jest pełna.
 */
export function findEmpty(board) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                return [r, c];
            }
        }
    }
    return null; // Plansza jest pełna
}

/**
 * Tasuje tablicę (algorytm Fisher-Yates shuffle).
 * @param {Array<any>} array - tablica do tasowania.
 * @returns {Array<any>} potasowana tablica.
 */
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Zwraca listę obiektów {row, col} dla wszystkich komórek, które zawierają błędy.
 * Błąd występuje, gdy liczba w komórce (wprowadzona przez użytkownika) jest duplikatem
 * w jej rzędzie, kolumnie lub bloku 3x3.
 * Liczby początkowe (z initialBoard) są traktowane jako poprawne i nie są oznaczane jako błędne,
 * ale są brane pod uwagę przy walidacji innych liczb.
 *
 * @param {Array<Array<number>>} currentBoard - aktualna plansza Sudoku (z liczbami użytkownika i początkowymi).
 * @param {Array<Array<number>>} initialBoard - plansza Sudoku z tylko początkowymi liczbami (0 dla pustych).
 * @returns {Array<{row: number, col: number}>} lista komórek z błędami (tylko te wprowadzone przez użytkownika).
 */
export function getErrors(currentBoard, initialBoard) {
    const errors = new Set(); // Użyj Set, aby uniknąć duplikatów

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const num = currentBoard[r][c];
            if (num === 0) continue; // Puste komórki nie są błędami

            // Sprawdź wiersz
            for (let x = 0; x < 9; x++) {
                if (x !== c && currentBoard[r][x] === num) {
                    // Jeśli obecna komórka (r,c) nie była początkowa, oznacz ją jako błąd
                    if (initialBoard[r][c] === 0) {
                        errors.add(`${r},${c}`);
                    }
                    // Jeśli kolidująca komórka (r,x) nie była początkowa, oznacz ją jako błąd
                    if (initialBoard[r][x] === 0) {
                        errors.add(`${r},${x}`);
                    }
                }
            }

            // Sprawdź kolumnę
            for (let x = 0; x < 9; x++) {
                if (x !== r && currentBoard[x][c] === num) {
                    if (initialBoard[r][c] === 0) {
                        errors.add(`${r},${c}`);
                    }
                    if (initialBoard[x][c] === 0) {
                        errors.add(`${x},${c}`);
                    }
                }
            }

            // Sprawdź blok 3x3
            const startRow = Math.floor(r / 3) * 3;
            const startCol = Math.floor(c / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const currRow = i + startRow;
                    const currCol = j + startCol;
                    if ((currRow !== r || currCol !== c) && currentBoard[currRow][currCol] === num) {
                        if (initialBoard[r][c] === 0) {
                            errors.add(`${r},${c}`);
                        }
                        if (initialBoard[currRow][currCol] === 0) {
                            errors.add(`${currRow},${currCol}`);
                        }
                    }
                }
            }
        }
    }
    // Konwertuj Set stringów "row,col" na tablicę obiektów {row, col}
    return Array.from(errors).map(coordStr => {
        const [row, col] = coordStr.split(',').map(Number);
        return { row, col };
    });
}

/**
 * Zwraca zbiór możliwych kandydatów (1-9) dla DANEJ PUSTEJ komórki,
 * biorąc pod uwagę WSZYSTKIE LICZBY (nawet błędne) w jej rzędzie, kolumnie i bloku.
 * Ta funkcja jest używana do obliczania automatycznych notatek.
 * @param {Array<Array<number>>} board - plansza Sudoku, wliczając liczby użytkownika (potencjalnie błędne).
 * @param {number} row - indeks wiersza.
 * @param {number} col - indeks kolumny.
 * @returns {Set<number>} Zbiór możliwych kandydatów.
 */
export function getPossibleCandidatesForCell(board, row, col) {
    const candidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    // Usuń kandydatów na podstawie rzędu
    for (let c_idx = 0; c_idx < 9; c_idx++) {
        if (board[row][c_idx] !== 0) {
            candidates.delete(board[row][c_idx]);
        }
    }

    // Usuń kandydatów na podstawie kolumny
    for (let r_idx = 0; r_idx < 9; r_idx++) {
        if (board[r_idx][col] !== 0) {
            candidates.delete(board[r_idx][col]);
        }
    }

    // Usuń kandydatów na podstawie bloku 3x3
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const currRow = i + startRow;
            const currCol = j + startCol;
            if (board[currRow][currCol] !== 0) {
                candidates.delete(board[currRow][currCol]);
            }
        }
    }
    return candidates;
}
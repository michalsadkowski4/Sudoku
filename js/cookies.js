// js/cookies.js

/**
 * Zapisuje ciasteczko.
 * @param {string} name - Nazwa ciasteczka.
 * @param {string} value - Wartość ciasteczka.
 * @param {number} days - Liczba dni, po których ciasteczko wygaśnie.
 */
export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

/**
 * Odczytuje wartość ciasteczka.
 * @param {string} name - Nazwa ciasteczka.
 * @returns {string|null} Wartość ciasteczka lub null, jeśli nie znaleziono.
 */
export function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

const WINS_COOKIE_NAME = 'sudoku_wins';

/**
 * Zapisuje dane o wygranej w ciasteczkach.
 * @param {{date: string, difficulty: string, time: number}} winData - Obiekt z danymi o wygranej.
 */
export function saveWin(winData) {
    const wins = getWins();
    wins.push(winData);
    setCookie(WINS_COOKIE_NAME, JSON.stringify(wins), 365); // Zapisz na rok
}

/**
 * Pobiera listę wszystkich wygranych z ciasteczek.
 * @returns {Array<{date: string, difficulty: string, time: number}>} Lista obiektów z danymi o wygranych.
 */
export function getWins() {
    const winsCookie = getCookie(WINS_COOKIE_NAME);
    if (winsCookie) {
        try {
            return JSON.parse(winsCookie);
        } catch (e) {
            console.error("Error parsing wins cookie:", e);
            return [];
        }
    }
    return [];
}
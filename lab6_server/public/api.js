// public/api.js

/**
 * Допоміжна функція для обробки помилок HTTP.
 * @param {Response} response
 */
function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`Помилка мережі. Статус: ${response.status}`);
    }
    return response.json();
}

/**
 * Функція getCurrentUsersCount: залишається простою, оскільки вона не залежить від масиву.
 * (Буде використовуватися у main.js для футера)
 */
function getCurrentUsersCount() {
    return Math.floor(Math.random() * 50) + 10;
}

// -------------------------------------------------------------
// АСИНХРОННІ ФУНКЦІЇ ДЛЯ ЗВ'ЯЗКУ З EXPRESS.JS:
// -------------------------------------------------------------

async function fetchUsers() {
    try {
        const response = await fetch('/api/users'); 
        return handleResponse(response);
    } catch (error) {
        console.error("Помилка при завантаженні користувачів:", error);
        throw new Error("Не вдалося завантажити 10 користувачів.");
    }
}

async function getNewUsers() {
    try {
        const response = await fetch('/api/new-users');
        return handleResponse(response);
    } catch (error) {
        console.error("Помилка при завантаженні нових користувачів:", error);
        throw new Error("Не вдалося завантажити нових користувачів.");
    }
}

async function fetchSortedUsers(column, direction) {
    try {
        const url = `/api/users/sort?column=${column}&direction=${direction}`;
        const response = await fetch(url);
        return handleResponse(response);
    } catch (error) {
        console.error("Помилка при сортуванні:", error);
        throw new Error("Не вдалося отримати сортовані дані.");
    }
}

async function fetchGalleryImages() {
    try {
        const response = await fetch('/api/gallery');
        return handleResponse(response);
    } catch (error) {
        console.error("Помилка при завантаженні галереї:", error);
        throw new Error("Не вдалося отримати список зображень.");
    }
}
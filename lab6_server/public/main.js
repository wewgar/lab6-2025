let currentLoadedUsers = []; // Зберігає останній завантажений масив користувачів
let currentSortOrder = { column: 'lastname', direction: 'asc' }; // Стан сортування для ЛР №4

document.addEventListener('DOMContentLoaded', init); // Викликаємо ініціалізацію після завантаження DOM

function init() {
    const mainContainer = document.getElementById('main');
    if (!mainContainer) return;

    // 1. Створення основної структури (header, content-container, footer)
    const header = document.createElement('header');
    header.id = 'header';
    const contentContainer = document.createElement('div');
    contentContainer.id = 'content-container'; // Для leftPanel, content, rightPanel
    const footer = document.createElement('footer');
    footer.id = 'footer';

    mainContainer.appendChild(header);
    mainContainer.appendChild(contentContainer);
    mainContainer.appendChild(footer);

    // 2. Створення внутрішніх панелей
    const leftPanel = document.createElement('div');
    leftPanel.id = 'leftPanel';
    const content = document.createElement('div');
    content.id = 'content';
    const rightPanel = document.createElement('div');
    rightPanel.id = 'rightPanel';

    contentContainer.appendChild(leftPanel);
    contentContainer.appendChild(content);
    contentContainer.appendChild(rightPanel);

    // 3. Додавання лоадерів
    const loaderHTML = '<div class="loader-container"><div class="loader"></div></div>';
    leftPanel.innerHTML = loaderHTML;
    content.innerHTML = loaderHTML;
    rightPanel.innerHTML = loaderHTML;

    // 4. Налаштування функціоналу
    setupHeader(header);
    setupFooter(footer);
    setupContentPanel(content);
    setupLeftPanel(leftPanel); // <-- Логіка погоди тепер тут
    setupRightPanel(rightPanel);
}

// =========================================================================
// БЛОК HEADER (Завдання 3, 10 + 2.d Галерея ЛР №6)
// =========================================================================
function setupHeader(headerElement) {
    const buttons = ['User Rating', 'News', 'Contacts', 'About', 'Галерея'];
    const contentDiv = document.getElementById('content');
    
    buttons.forEach(text => {
        const btn = document.createElement('button');
        btn.textContent = text;
        
        btn.addEventListener('click', () => {
            // Приховуємо вміст rightPanel
            document.getElementById('rightPanel').innerHTML = ''; 
            
            contentDiv.innerHTML = `<h2>${text}</h2>`;

            if (text === 'User Rating') {
                // Відновлюємо контейнер Get Users
                setupContentPanel(contentDiv);
            } else if (text === 'Галерея') {
                displayGallery(contentDiv); // Виклик функції галереї
            }
        });
        headerElement.appendChild(btn);
    });
}

// Функція для відображення галереї (Завдання 2.d ЛР №6)
async function displayGallery(contentElement) {
    contentElement.innerHTML = '<h2>Галерея</h2><div class="loader-container"><div class="loader"></div></div>';
    
    try {
        const images = await fetchGalleryImages(); // З api.js
        
        let galleryHTML = '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
        
        if (images.length === 0) {
            galleryHTML += '<p>Зображення не знайдено в папці gallery.</p>';
        } else {
            images.forEach(imgName => {
                // Шлях до зображення через статичну папку public/gallery
                const imgPath = `/gallery/${imgName}`; 
                galleryHTML += `
                    <img src="${imgPath}" alt="${imgName}" style="width: 30%; height: auto; object-fit: cover; border: 1px solid #ccc;">
                `;
            });
        }
        galleryHTML += '</div>';
        
        contentElement.innerHTML = galleryHTML;

    } catch (error) {
        contentElement.innerHTML = `<p style="color: red;">Помилка завантаження галереї: ${error}</p>`;
    }
}


// =========================================================================
// БЛОК FOOTER (Завдання 3, 11)
// =========================================================================
function setupFooter(footerElement) {
    // Current Users - Припустимо, що 10 завантажених користувачів активні
    const currentUsersBlock = document.createElement('div');
    currentUsersBlock.innerHTML = `
        <h4>Current users</h4>
        <p id="activeUserCount">${currentLoadedUsers.length} active users</p>
    `;
    footerElement.appendChild(currentUsersBlock);

    // New Users - Список останніх 5 (Завдання 3, 11)
    getNewUsers() // Виклик API
        .then(newUsers => {
            const newUsersBlock = document.createElement('div');
            const userList = newUsers.map(u => `<li>${u.lastname}</li>`).join('');
            newUsersBlock.innerHTML = `
                <h4>New users (5 latest)</h4>
                <ul>${userList}</ul>
            `;
            footerElement.appendChild(newUsersBlock);
        })
        .catch(err => {
             const errorBlock = document.createElement('div');
             errorBlock.innerHTML = `<h4>New users</h4><p style="color: red;">Error: ${err}</p>`;
             footerElement.appendChild(errorBlock);
        });
}


// =========================================================================
// БЛОК CONTENT (Завдання 3, 12, 5)
// =========================================================================
function setupContentPanel(contentElement) {
    // Приховуємо лоадер через 1 секунду (Завдання 3, 112)
    setTimeout(() => {
        const loader = contentElement.querySelector('.loader-container');
        if (loader) loader.remove();
        
        const container = document.createElement('div');
        container.id = 'get-users-container';
        container.innerHTML = `
            <p>No users</p>
            <button id="getUsersBtn">Get Users</button>
        `;
        contentElement.appendChild(container);

        document.getElementById('getUsersBtn').addEventListener('click', loadUsersAndDisplay);

    }, 1000);
}

async function loadUsersAndDisplay() {
    const container = document.getElementById('get-users-container');
    container.innerHTML = '<h2>Loading users...</h2><div class="loader-container"><div class="loader"></div></div>';
    
    try {
        const users = await fetchUsers(); // Виклик API
        currentLoadedUsers = users;
        
        container.innerHTML = '';
        createUsersTable(users, container);
        updateRightPanelStats(users);
        document.getElementById('activeUserCount').textContent = `${users.length} active users`;

    } catch (error) {
        container.innerHTML = `<p style="color: red;">Помилка завантаження: ${error.message}</p>`;
    }
}


// =========================================================================
// БЛОК LEFT PANEL (Завдання 6 + Погода ЛР №6)
// =========================================================================
function setupLeftPanel(leftPanelElement) {
    const loader = leftPanelElement.querySelector('.loader-container');

    setTimeout(() => {
        if (loader) loader.remove();

        leftPanelElement.innerHTML = `
            <h2>Пошук та Налаштування</h2>
            <input type="text" id="searchInput" placeholder="Введіть фрагмент...">
            <button id="searchBtn">Пошук</button>
            <button id="clearSearchBtn">Очистити</button>
            
            <hr>
            
            <div id="weatherBlock">
                <h4>Погода</h4>
                <p>Завантаження даних...</p>
            </div>
        `;

        document.getElementById('searchBtn').addEventListener('click', searchUsers);
        document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);
        
        // --- ЗАПУСК ПОГОДИ (КРИТИЧНЕ ВИПРАВЛЕННЯ!) ---
        updateWeather(); // Перший запуск
        setInterval(updateWeather, 60000); 

    }, 1000);
}

// Логіка оновлення погоди (Завдання 3 ЛР №6)
function updateWeather() {
    fetch('/weather') // Звернення до сервера Express
        .then(res => res.json())
        .then(data => {
            const weatherBlock = document.getElementById('weatherBlock');
            if (weatherBlock) {
                weatherBlock.innerHTML = `
                    <h4>Погода</h4>
                    <p>Місто: <strong>${data.city}</strong></p>
                    <p>Температура: <strong>${data.temperature}°C</strong></p>
                `;
            }
        })
        .catch(err => {
             const weatherBlock = document.getElementById('weatherBlock');
             if (weatherBlock) weatherBlock.innerHTML = '<h4>Погода</h4><p style="color: red;">Помилка API</p>';
        });
}


// =========================================================================
// БЛОК RIGHT PANEL (Завдання 7, 8)
// =========================================================================
function setupRightPanel(rightPanelElement) {
    const loader = rightPanelElement.querySelector('.loader-container');

    setTimeout(() => {
        if (loader) loader.remove();

        rightPanelElement.innerHTML = `
            <h2>Статистика та налаштування</h2>
            <div id="statsPlaceholder"></div>
            
            <hr>
            
            <div>
                <input type="checkbox" id="editTableCheckbox">
                <label for="editTableCheckbox">Edit table</label>
            </div>
        `;
        
        document.getElementById('editTableCheckbox').addEventListener('change', toggleEditMode);
    }, 1000);
}

function updateRightPanelStats(users) {
    // Сума балів (Завдання 7)
    const totalScore = users.reduce((sum, user) => sum + user.score, 0);
    
    document.getElementById('statsPlaceholder').innerHTML = `
        <h3>Сума балів</h3>
        <p>Загальна сума балів: <strong>${totalScore}</strong></p>
    `;
}


// =========================================================================
// ФУНКЦІЇ ТАБЛИЦІ (Завдання 5, 8, 9)
// =========================================================================
function createUsersTable(users, container) {
    let table = document.getElementById('usersTable');
    if (table) table.remove();
    
    table = document.createElement('table');
    table.id = 'usersTable';
    
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    
    const headers = ['Firstname', 'Lastname', 'Score'];
    
    headers.forEach((text, index) => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
        
        // Сортування при кліку на Прізвище (Завдання 9)
        if (text === 'Lastname') {
             th.addEventListener('click', () => sortUsersInTable('lastname'));
        }
        // Додайте тут логіку для сортування за Firstname та Score, якщо потрібно
    });
    
    // Додаткова колонка Delete (Завдання 8)
    const isEditMode = document.getElementById('editTableCheckbox')?.checked;
    if (isEditMode) {
        const th = document.createElement('th');
        th.textContent = 'Actions';
        headerRow.appendChild(th);
    }
    
    const tbody = table.createTBody();
    users.forEach(user => {
        appendUserRow(tbody, user, isEditMode);
    });

    container.appendChild(table);
}

function appendUserRow(tbody, user, isEditMode) {
    const row = tbody.insertRow();
    row.insertCell().textContent = user.firstname;
    row.insertCell().textContent = user.lastname;
    row.insertCell().textContent = user.score;

    if (isEditMode) {
        const actionCell = row.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        
        deleteBtn.addEventListener('click', () => {
            row.remove(); // Видалення рядка (Завдання 8)
        });
        actionCell.appendChild(deleteBtn);
    }
}

function toggleEditMode(event) {
    const isEditMode = event.target.checked;
    const table = document.getElementById('usersTable');
    if (!table) return;

    // Отримуємо поточні дані з DOM (включаючи видалені користувачем)
    const usersData = Array.from(table.rows).slice(1).map(row => ({
        firstname: row.cells[0].textContent,
        lastname: row.cells[1].textContent,
        score: parseInt(row.cells[2].textContent)
    }));

    const content = document.getElementById('content');
    table.remove();

    // Відновлюємо таблицю з новими колонками (Або без них)
    createUsersTable(usersData, content); 
}

function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const table = document.getElementById('usersTable');
    if (!table) return;

    // Прибираємо попереднє виділення
    table.querySelectorAll('tr').forEach(row => row.classList.remove('highlight'));

    if (searchTerm.length === 0) return;

    // Обійти всі рядки (крім заголовка)
    Array.from(table.rows).slice(1).forEach(row => {
        // Перевіряємо вміст перших трьох колонок
        const cellContents = Array.from(row.cells).slice(0, 3).map(cell => cell.textContent.toLowerCase()).join(' ');
        
        if (cellContents.includes(searchTerm)) {
            row.classList.add('highlight'); // Виділення рядка (Завдання 6)
        }
    });
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    const table = document.getElementById('usersTable');
    if (table) {
        table.querySelectorAll('tr').forEach(row => row.classList.remove('highlight'));
    }
}


// Сортування на стороні клієнта (Завдання 9)
function sortUsersInTable(column) {
    const table = document.getElementById('usersTable');
    if (!table) return;
    
    // Визначаємо поточний напрямок і перемикаємо його
    const currentDirection = currentSortOrder.column === column && currentSortOrder.direction === 'asc' ? 'desc' : 'asc';
    currentSortOrder = { column, direction: currentDirection };

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.rows);
    
    rows.sort((rowA, rowB) => {
        // 1 - Прізвище, 2 - Score
        const cellIndex = column === 'lastname' ? 1 : 2; 
        const valA = rowA.cells[cellIndex].textContent;
        const valB = rowB.cells[cellIndex].textContent;

        let comparison = 0;
        
        if (column === 'score') {
            comparison = parseInt(valA) - parseInt(valB);
        } else {
            comparison = valA.localeCompare(valB, 'uk', { sensitivity: 'base' });
        }
        
        return currentDirection === 'asc' ? comparison : comparison * -1;
    });

    // Оновлюємо таблицю відсортованими рядками
    rows.forEach(row => tbody.appendChild(row));
}
let currentLoadedUsers = []; 
let currentSortOrder = { column: 'lastname', direction: 'asc' }; 

document.addEventListener('DOMContentLoaded', init);

function init() {
    const mainContainer = document.getElementById('main');
    if (!mainContainer) return;

   
    const header = document.createElement('header');
    header.id = 'header';
    const contentContainer = document.createElement('div');
    contentContainer.id = 'content-container'; 
    const footer = document.createElement('footer');
    footer.id = 'footer';

    mainContainer.appendChild(header);
    mainContainer.appendChild(contentContainer);
    mainContainer.appendChild(footer);

    const leftPanel = document.createElement('div');
    leftPanel.id = 'leftPanel';
    const content = document.createElement('div');
    content.id = 'content';
    const rightPanel = document.createElement('div');
    rightPanel.id = 'rightPanel';

    contentContainer.appendChild(leftPanel);
    contentContainer.appendChild(content);
    contentContainer.appendChild(rightPanel);

    
    const loaderHTML = '<div class="loader-container"><div class="loader"></div></div>';
    leftPanel.innerHTML = loaderHTML;
    content.innerHTML = loaderHTML;
    rightPanel.innerHTML = loaderHTML;

    
    setupHeader(header);
    setupFooter(footer);
    setupContentPanel(content);
    setupLeftPanel(leftPanel); 
    setupRightPanel(rightPanel);
}


function setupHeader(headerElement) {
    const buttons = ['User Rating', 'News', 'Contacts', 'About', 'Галерея'];
    const contentDiv = document.getElementById('content');
    
    buttons.forEach(text => {
        const btn = document.createElement('button');
        btn.textContent = text;
        
        btn.addEventListener('click', () => {
            
            document.getElementById('rightPanel').innerHTML = ''; 
            
            contentDiv.innerHTML = `<h2>${text}</h2>`;

            if (text === 'User Rating') {
                
                setupContentPanel(contentDiv);
            } else if (text === 'Галерея') {
                displayGallery(contentDiv); 
            }
        });
        headerElement.appendChild(btn);
    });
}


async function displayGallery(contentElement) {
    contentElement.innerHTML = '<h2>Галерея</h2><div class="loader-container"><div class="loader"></div></div>';
    
    try {
        const images = await fetchGalleryImages(); 
        
        let galleryHTML = '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
        
        if (images.length === 0) {
            galleryHTML += '<p>Зображення не знайдено в папці gallery.</p>';
        } else {
            images.forEach(imgName => {
                
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



function setupFooter(footerElement) {

    const currentUsersBlock = document.createElement('div');
    currentUsersBlock.innerHTML = `
        <h4>Current users</h4>
        <p id="activeUserCount">${currentLoadedUsers.length} active users</p>
    `;
    footerElement.appendChild(currentUsersBlock);

    
    getNewUsers() 
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



function setupContentPanel(contentElement) {
    
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
        const users = await fetchUsers(); 
        currentLoadedUsers = users;
        
        container.innerHTML = '';
        createUsersTable(users, container);
        updateRightPanelStats(users);
        document.getElementById('activeUserCount').textContent = `${users.length} active users`;

    } catch (error) {
        container.innerHTML = `<p style="color: red;">Помилка завантаження: ${error.message}</p>`;
    }
}



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
        
      
        updateWeather(); 
        setInterval(updateWeather, 60000); 

    }, 1000);
}


function updateWeather() {
    fetch('/weather') 
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
    
    const totalScore = users.reduce((sum, user) => sum + user.score, 0);
    
    document.getElementById('statsPlaceholder').innerHTML = `
        <h3>Сума балів</h3>
        <p>Загальна сума балів: <strong>${totalScore}</strong></p>
    `;
}



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
        
        
        if (text === 'Lastname') {
             th.addEventListener('click', () => sortUsersInTable('lastname'));
        }
        
    });
    
   
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
            row.remove(); 
        });
        actionCell.appendChild(deleteBtn);
    }
}

function toggleEditMode(event) {
    const isEditMode = event.target.checked;
    const table = document.getElementById('usersTable');
    if (!table) return;

    
    const usersData = Array.from(table.rows).slice(1).map(row => ({
        firstname: row.cells[0].textContent,
        lastname: row.cells[1].textContent,
        score: parseInt(row.cells[2].textContent)
    }));

    const content = document.getElementById('content');
    table.remove();

    
    createUsersTable(usersData, content); 
}

function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const table = document.getElementById('usersTable');
    if (!table) return;

    
    table.querySelectorAll('tr').forEach(row => row.classList.remove('highlight'));

    if (searchTerm.length === 0) return;

    
    Array.from(table.rows).slice(1).forEach(row => {
       
        const cellContents = Array.from(row.cells).slice(0, 3).map(cell => cell.textContent.toLowerCase()).join(' ');
        
        if (cellContents.includes(searchTerm)) {
            row.classList.add('highlight'); 
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



function sortUsersInTable(column) {
    const table = document.getElementById('usersTable');
    if (!table) return;
    
    
    const currentDirection = currentSortOrder.column === column && currentSortOrder.direction === 'asc' ? 'desc' : 'asc';
    currentSortOrder = { column, direction: currentDirection };

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.rows);
    
    rows.sort((rowA, rowB) => {
        
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

    
    rows.forEach(row => tbody.appendChild(row));
}
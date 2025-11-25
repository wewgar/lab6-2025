let currentLoadedUsers = [];

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

    const loaderHTML = '<div class="loader"></div>';
    leftPanel.innerHTML = loaderHTML;
    content.innerHTML = loaderHTML;
    rightPanel.innerHTML = loaderHTML;

    setupHeader(header, content);
    setupFooter(footer);
    setupContentPanel(content);
    setupLeftPanel(leftPanel);
    setupRightPanel(rightPanel);
}

function setupHeader(headerElement, contentElement) {
    const buttons = ['User Rating', 'News', 'Contacts', 'About'];

    buttons.forEach(text => {
        const btn = document.createElement('button');
        btn.textContent = text;
        
        btn.addEventListener('click', () => {
            const contentDiv = document.getElementById('content');
            
            contentDiv.innerHTML = `<h2>${text}</h2>`;
            
            if (text === 'User Rating') {
                contentDiv.appendChild(document.getElementById('get-users-container'));
                document.getElementById('rightPanel').innerHTML = '';
                setupRightPanel(document.getElementById('rightPanel'));
            }
        });
        headerElement.appendChild(btn);
    });
}

function setupFooter(footerElement) {
    const currentUsersBlock = document.createElement('div');
    currentUsersBlock.innerHTML = `
        <h4>Current users</h4>
        <p>${getCurrentUsersCount()} active users</p>
    `;
    footerElement.appendChild(currentUsersBlock);

    const newUsers = getNewUsers();
    const newUsersBlock = document.createElement('div');
    const userList = newUsers.map(u => `<li>${u.lastname}</li>`).join('');
    newUsersBlock.innerHTML = `
        <h4>New users (5 latest)</h4>
        <ul>${userList}</ul>
    `;
    footerElement.appendChild(newUsersBlock);
}

function setupContentPanel(contentElement) {
    const loader = contentElement.querySelector('.loader');

    setTimeout(() => {
        if (loader) loader.style.display = 'none';
        
        const container = document.createElement('div');
        container.id = 'get-users-container';
        container.innerHTML = `
            <p>No users</p>
            <button id="getUsersBtn">Get Users</button>
        `;
        contentElement.appendChild(container);

        document.getElementById('getUsersBtn').addEventListener('click', () => {
            container.innerHTML = '<h2>Loading users...</h2><div class="loader"></div>';
            
            fetchUsers()
                .then(users => {
                    currentLoadedUsers = users;
                    container.innerHTML = '';
                    createUsersTable(users, container);
                    updateRightPanel(users);
                })
                .catch(error => {
                    container.innerHTML = `<p style="color: red;">Error loading users: ${error}</p>`;
                });
        });
    }, 1000);
}

function setupLeftPanel(leftPanelElement) {
    const loader = leftPanelElement.querySelector('.loader');

    setTimeout(() => {
        if (loader) loader.style.display = 'none';

        leftPanelElement.innerHTML = `
            <h2>Пошук за прізвищем</h2>
            <input type="text" id="searchInput" placeholder="Введіть фрагмент...">
            <button id="searchBtn">Пошук</button>
            <button id="clearSearchBtn">Очистити</button>
        `;

        document.getElementById('searchBtn').addEventListener('click', searchUsers);
        document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);
    }, 1000);
}

function setupRightPanel(rightPanelElement) {
    const loader = rightPanelElement.querySelector('.loader');

    setTimeout(() => {
        if (loader) loader.style.display = 'none';

        rightPanelElement.innerHTML = `
            <h2>Статистика та налаштування</h2>
            <div id="statsPlaceholder"></div>
            
            <div>
                <input type="checkbox" id="editTableCheckbox">
                <label for="editTableCheckbox">Edit table</label>
            </div>
        `;
        
        document.getElementById('editTableCheckbox').addEventListener('change', toggleEditMode);
    }, 1000);
}

function createUsersTable(users, container) {
    let table = document.getElementById('usersTable');
    if (table) table.remove();
    
    table = document.createElement('table');
    table.id = 'usersTable';
    
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    
    const headers = ['Firstname', 'Lastname', 'Score'];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    
    headerRow.cells[1].addEventListener('click', sortTableByLastName);

    if (document.getElementById('editTableCheckbox')?.checked) {
        const th = document.createElement('th');
        th.textContent = 'Actions';
        headerRow.appendChild(th);
    }
    
    const tbody = table.createTBody();
    users.forEach(user => {
        appendUserRow(tbody, user);
    });

    container.appendChild(table);
}

function appendUserRow(tbody, user) {
    const row = tbody.insertRow();
    row.insertCell().textContent = user.firstname;
    row.insertCell().textContent = user.lastname;
    row.insertCell().textContent = user.score;

    if (document.getElementById('editTableCheckbox')?.checked) {
        const actionCell = row.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        
        deleteBtn.addEventListener('click', () => {
            row.remove();
        });
        actionCell.appendChild(deleteBtn);
    }
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

function updateRightPanel(users) {
    const totalScore = users.reduce((sum, user) => sum + user.score, 0);
    
    document.getElementById('statsPlaceholder').innerHTML = `
        <h3>Сума балів</h3>
        <p>Загальна сума балів 10 завантажених користувачів: <strong>${totalScore}</strong></p>
    `;
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

function sortTableByLastName() {
    const table = document.getElementById('usersTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.rows);
    
    const isAscending = tbody.dataset.sortOrder !== 'desc';
    
    rows.sort((rowA, rowB) => {
        const lastNameA = rowA.cells[1].textContent.toLowerCase();
        const lastNameB = rowB.cells[1].textContent.toLowerCase();

        if (lastNameA < lastNameB) return isAscending ? -1 : 1;
        if (lastNameA > lastNameB) return isAscending ? 1 : -1;
        return 0;
    });

    rows.forEach(row => tbody.appendChild(row));
    
    tbody.dataset.sortOrder = isAscending ? 'desc' : 'asc';
}
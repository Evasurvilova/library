// ============================================
// БАЗОВЫЙ URL API
// ============================================

const API_URL = 'https://localhost:7201/api';

// ============================================
// ДАННЫЕ (на случай, если сервер не ответит)
// ============================================

const fallbackBooks = [
    { 
        id: 1, 
        title: "Преступление и наказание", 
        author: "Ф.М. Достоевский", 
        year: 2023, 
        pages: 576, 
        cover: "images/book2.webp", 
        publisher: "Эксмо",
        copies: [
            { invNumber: "INV-004", status: "available" },
            { invNumber: "INV-005", status: "restoration" }
        ]
    },
    { 
        id: 2, 
        title: "Девяносто третий год", 
        author: "Виктор Гюго", 
        year: 2023, 
        pages: 480, 
        cover: "images/Ninety-third year.jpg", 
        publisher: "АСТ",
        copies: [
            { invNumber: "INV-009", status: "available" },
            { invNumber: "INV-010", status: "occupied", returnDate: "25.06.2026" }
        ]
    }
];


const fallbackEvents = [
    { id: 1, title: "Вокальная студия Елены Кряжевских", date: "Среда 14:00", image: "images/event1.webp" },
    { id: 2, title: "Творчиские посиделки", date: "13 мая 14:00", image: "images/event2.webp" }
];

const users = [
    { id: 1, name: "Иван Петров", email: "ivan@mail.ru", password: "12345678", role: "Читатель" },
    { id: 2, name: "Админ Главный", email: "admin@library.ru", password: "87654321", role: "Администратор" }
];


// ============================================
// ФУНКЦИИ ДЛЯ ЗАГРУЗКИ ДАННЫХ С СЕРВЕРА
// ============================================

function loadBooks(callback) {
    fetch(`${API_URL}/books`)
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => {
            console.error('Ошибка загрузки книг, используем локальные данные:', error);
            callback(fallbackBooks);
        });
}

function loadEvents(callback) {
    fetch(`${API_URL}/events`)
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => {
            console.error('Ошибка загрузки мероприятий, используем локальные данные:', error);
            callback(fallbackEvents);
        });
}

function loadReaders(callback) {
    fetch(`${API_URL}/readers`)
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => {
            console.error('Ошибка загрузки читателей, используем локальные данные:', error);
            callback(fallbackReaders);
        });
}

function reserveBookOnServer(id, callback) {
    fetch(`${API_URL}/books/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify('reserved')
    })
        .then(response => callback(response.ok))
        .catch(error => {
            console.error('Ошибка бронирования:', error);
            callback(false);
        });
}

function addReaderOnServer(reader, callback) {
    fetch(`${API_URL}/readers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reader)
    })
        .then(response => callback(response.ok))
        .catch(error => {
            console.error('Ошибка добавления читателя:', error);
            callback(false);
        });
}

// ============================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ============================================

let currentUser = null; // { name, email, role }
let currentPage = 'role-select'; // 'role-select' | 'login' | 'register' | 'app'


// ============================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ СТАТУСА
// ============================================
function getStatusDisplay(copy) {
    switch(copy.status) {
        case 'available':
            return '<span style="color:green;">✓ В наличии</span>';
        case 'reserved':
            return '<span style="color:orange;">⏳ Забронирована</span>';
        case 'occupied':
            return `<span style="color:red;">✗ Занята до ${copy.returnDate}</span>`;
        case 'restoration':
            return '<span style="color:purple;">🔧 В реставрации</span>';
        default:
            return '<span style="color:gray;">Статус неизвестен</span>';
    }
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ ОТРИСОВКИ
// ============================================


function renderApp() {
    const app = document.getElementById('app');
    if (!app) return;
    
    switch(currentPage) {
        case 'role-select':
            app.innerHTML = renderRoleSelect();
            break;
        case 'login':
            app.innerHTML = renderLoginForm();
            break;
        case 'register':
            app.innerHTML = renderRegisterForm();
            break;
        case 'app':
            if (currentUser.role === 'librarian') {
                renderLibrarianInterface();
            } else if (currentUser.role === 'reader') {
                renderReaderInterface();
            } else {
                renderGuestInterface();
            }
            break;
        default:
            app.innerHTML = '<h1>Ошибка загрузки</h1>';
    }
}

// ============================================
// СТРАНИЦА ВЫБОРА РОЛИ
// ============================================

function renderRoleSelect() {
    return `
        <div class="page active">
            <div class="header-logo">
                <img src="images/logo.webp">
                <h1>Центральная городская библиотека<br>им. А.С. Горловского</h1>
            </div>

            <div class="role-select">
                <button class="btn-primary" onclick="goToLogin('reader')">Войти как Читатель</button>
                <button class="btn-primary" onclick="goToLogin('librarian')">Войти как Библиотекарь</button>
                <div class="guest-link" onclick="goToGuest()">Остаться Гостем</div>
            </div>
        </div>
    `;
}

function goToLogin(role) {
    currentPage = 'login';
    renderApp();
}

function goToGuest() {
    currentUser = { name: "Гость", email: "", role: "guest" };
    currentPage = 'app';
    renderApp();
}

// ============================================
// СТРАНИЦА ВХОДА
// ============================================

function renderLoginForm() {
    return `
        <div class="page active">
            <div class="auth-form">
                <img src="images/logo.webp" class="logo">
                <h2>Вход в личный кабинет</h2>
                <input id="loginEmail" placeholder="Элек. Почта:">
                <input id="loginPassword" placeholder="Пароль:" type="password">
                <p style="font-size:12px; color:#666; text-align:left; cursor:pointer;">Забыли пароль?</p>
                <button class="btn-primary" onclick="performLogin()">Войти</button>
                <div class="link" onclick="goToRegister()">Нет аккаунта? Зарегистрироваться</div>
                <div class="link" onclick="goToRoleSelect()">← Назад к выбору роли</div>
            </div>
        </div>
    `;
}


// ============================================
// СТРАНИЦА РЕГИСТРАЦИИ
// ============================================

function renderRegisterForm() {
    return `
        <div class="page active">
            <div class="auth-form">
                <img src="images/logo.webp" class="logo">
                <h2>Регистрация читателя</h2>
                <input id="regName" placeholder="ФИО:">
                <input id="regEmail" placeholder="Элек. Почта:">
                <input id="regPassword" placeholder="Пароль:" type="password">
                <p style="font-size:12px; color:#666; text-align:left;">Не менее 8 символов</p>
                <button class="btn-primary" onclick="performRegister()">Зарегистрироваться</button>
                
                <div style="margin-top:15px; border-top:1px solid #ddd; padding-top:15px;">
                    <div style="font-size:14px; color:#666; margin-bottom:10px;">или войдите через:</div>
                    <div class="link" onclick="alert('Вход через Госуслуги (в разработке)')" style="display:block; margin:5px 0;">
                        Войти через Госуслуги
                    </div>
                    <div class="link" onclick="alert('Вход через Цифровой ID (в разработке)')" style="display:block; margin:5px 0;">
                        Войти через Цифровой ID
                    </div>
                </div>
                
                <div class="link" onclick="goToLogin('reader')">Уже есть аккаунт? Войти</div>
                <div class="link" onclick="goToRoleSelect()">← Назад к выбору роли</div>
            </div>
        </div>
    `;
}

// ============================================
// ИНТЕРФЕЙС ГОСТЯ
// ============================================

function renderGuestInterface() {
    const app = document.getElementById('app');
    
    loadBooks(function(books) {
        loadEvents(function(events) {
            app.innerHTML = `
                <div class="page active">
                    <div class="header-logo">
                        <img src="images/logo.webp">
                        <h1>Центральная городская библиотека</h1>
                    </div>

                    <div style="text-align:right; margin-bottom:10px;">
                        <button class="btn-primary small" onclick="goToRoleSelect()">Сменить роль</button>
                    </div>

                    <div class="search-bar">
    <input id="searchInput" placeholder="Введите автора, название..." oninput="filterGuestBooks()">
    <span>🔍</span>
</div>
<div id="guestBooksContainer" class="book-grid">
    ${books.slice(0, 3).map(b => `
        <div class="book-card">
            <img src="${b.cover}">
            <div class="book-title">${b.title}</div>
        </div>
    `).join('')}
</div>

                    <div class="section-title">Новые поступления</div>
                    <div class="book-grid">
                        ${books.slice(0, 3).map(b => `
                            <div class="book-card">
                                <img src="${b.cover}">
                                <div class="book-title">${b.title}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="section-title">Ближайшие мероприятия</div>
                    ${events.map(e => `
                        <div class="event-card">
                            <img src="${e.image}">
                            <div class="event-info">
                                <h4>${e.title}</h4>
                                <p>${e.date}</p>
                                <button class="btn-primary small" onclick="alert('Для регистрации войдите как Читатель')">Записаться</button>
                            </div>
                        </div>
                    `).join('')}
                    
                    <div style="text-align:center; margin-top:20px;">
                        <button class="btn-primary small" onclick="goToLogin('reader')">Войти</button>
                        <button class="btn-primary small" onclick="goToRegister()">Зарегистрироваться</button>
                    </div>
                </div>
            `;
        });
    });
}

function filterGuestBooks() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const container = document.getElementById('guestBooksContainer');
    
    // Используем локальные данные (fallbackBooks)
    const filtered = fallbackBooks.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.author.toLowerCase().includes(query)
    );
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px;">Книги не найдены</div>';
        return;
    }
    
    container.innerHTML = filtered.map(b => `
        <div class="book-card">
            <img src="${b.cover}">
            <div class="book-title">${b.title}</div>
        </div>
    `).join('');
}
// ============================================
// ИНТЕРФЕЙС ЧИТАТЕЛЯ
// ============================================

function renderReaderInterface() {
    const app = document.getElementById('app');
    
    loadBooks(function(books) {
        app.innerHTML = `
            <div class="page active">
                <div class="header-logo">
                    <img src="images/logo.webp" alt="Логотип">
                    <h1>Центральная городская библиотека</h1>
                </div>

                <div style="text-align:right; margin-bottom:10px; display:flex; justify-content:flex-end; gap:10px;">
                    <button class="btn-primary small" onclick="logout()" style="width:auto;">Выйти</button>
                    <button class="btn-primary small" style="width:auto; background:#dc3545;" onclick="deleteAccount()">Удалить аккаунт</button>
                </div>

                <div class="search-bar">
                    <input id="searchInputReader" placeholder="Введите автора, название..." oninput="filterReaderBooks()">
                    <span>🔍</span>
                </div>

                <div class="welcome-text">Здравствуйте, ${currentUser.name}!</div>
                
                <div class="action-buttons">
                    <button class="btn-primary" onclick="showReaderForm()">Мой формуляр</button>
                    <button class="btn-primary" onclick="showReaderEvents()">Мои мероприятия</button>
                </div>

                <div class="section-title">Персональные рекомендации</div>
                <div class="book-grid">
                    ${books.slice(0, 3).map(b => `
                        <div class="book-card" onclick="showReaderBook(${b.id})">
                            <img src="${b.cover}" alt="${b.title}">
                            <div class="book-title">${b.title}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="section-title">Новые поступления</div>
                <div class="book-grid">
                    ${books.slice(3, 6).map(b => `
                        <div class="book-card" onclick="showReaderBook(${b.id})">
                            <img src="${b.cover}" alt="${b.title}">
                            <div class="book-title">${b.title}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
}

function filterReaderBooks() {
    const query = document.getElementById('searchInputReader').value.toLowerCase();
    
    // Загружаем книги из API
    loadBooks(function(books) {
        const filtered = books.filter(b => 
            b.title.toLowerCase().includes(query) || 
            b.author.toLowerCase().includes(query)
        );
        
        // Обновляем только сетку книг, не перерисовывая всю страницу
        const grid = document.querySelector('.book-grid');
        if (grid) {
            if (filtered.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px;">Книги не найдены</div>';
                return;
            }
            grid.innerHTML = filtered.map(b => `
                <div class="book-card" onclick="showReaderBook(${b.id})">
                    <img src="${b.cover}">
                    <div class="book-title">${b.title}</div>
                </div>
            `).join('');
        }
    });
}

function showReaderCatalog() {
    const app = document.getElementById('app');
    
    loadBooks(function(books) {
        app.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <button class="btn-back" onclick="renderApp()">← На главную</button>
                <span style="font-size:14px; color:#666;">Найдено: ${books.length} книг</span>
            </div>
            <div class="search-bar">
                <input id="searchInputCatalog" placeholder="Введите автора, название..." oninput="filterCatalogBooks()">
                <span>🔍</span>
            </div>
            <div id="catalogBooksContainer" class="book-grid">
                ${books.map(b => `
                    <div class="book-card" onclick="showReaderBook(${b.id})">
                        <img src="${b.cover}">
                        <div class="book-title">${b.title}</div>
                    </div>
                `).join('')}
            </div>
        `;
    });
}

function filterCatalogBooks() {
    const query = document.getElementById('searchInputCatalog').value.toLowerCase();
    const container = document.getElementById('catalogBooksContainer');
    
    loadBooks(function(books) {
        const filtered = books.filter(b => 
            b.title.toLowerCase().includes(query) || 
            b.author.toLowerCase().includes(query)
        );
        
        if (filtered.length === 0) {
            container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px;">Книги не найдены</div>';
            return;
        }
        
        container.innerHTML = filtered.map(b => `
            <div class="book-card" onclick="showReaderBook(${b.id})">
                <img src="${b.cover}">
                <div class="book-title">${b.title}</div>
            </div>
        `).join('');
    });
}


function showReaderBook(id) {
    const app = document.getElementById('app');
    
    loadBooks(function(books) {
        const book = books.find(b => b.id === id);
        if (!book) return;

        // Создаем HTML для каждого экземпляра
        let copiesHtml = '';
        if (book.copies && book.copies.length > 0) {
            copiesHtml = `
                <div style="margin-top: 15px;">
                    <h4>Физические экземпляры:</h4>
                    <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px;">
                        ${book.copies.map((copy, index) => `
                            <div style="background:#f0f0f0; padding:10px; border-radius:8px; min-width:150px;">
                                <div style="font-size:12px; color:#666;">Инв. № ${copy.invNumber}</div>
                                <div style="font-weight:bold; margin-top:5px;">${getStatusDisplay(copy)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            copiesHtml = '<div style="margin-top:15px; color:#666;">Нет физических экземпляров</div>';
        }

        // Проверяем, есть ли доступный экземпляр
        const hasAvailableCopy = book.copies && book.copies.some(c => c.status === 'available');

        app.innerHTML = `
            <div class="page active">
                <button class="btn-back" onclick="renderApp()">← Назад</button>
                <div class="book-detail-container">
                    <div class="cover">
                        <img src="${book.cover}" style="width:100%; border-radius:5px;">
                    </div>
                    <div class="info">
                        <h2>${book.title}</h2>
                        <p><strong>Автор:</strong> ${book.author}</p>
                        <p><strong>Год:</strong> ${book.year}</p>
                        ${book.publisher ? `<p><strong>Издательство:</strong> ${book.publisher}</p>` : ''}
                        ${book.pages ? `<p><strong>Страниц:</strong> ${book.pages}</p>` : ''}
                        ${book.genre ? `<p><strong>Жанр:</strong> ${book.genre}</p>` : ''}
                        
                        ${copiesHtml}
                        
                        ${hasAvailableCopy ? 
                            `<button class="btn-primary" onclick="reserveBook(${book.id})">Забронировать доступный экземпляр</button>` : 
                            `<button class="btn-primary" style="background:#999;" disabled>Нет доступных экземпляров</button>`
                        }
                    </div>
                </div>
            </div>
        `;
    });
}

function reserveBook(id) {
    // Находим первый доступный экземпляр
    loadBooks(function(books) {
        const book = books.find(b => b.id === id);
        if (!book) return;
        
        const availableCopy = book.copies.find(c => c.status === 'available');
        if (!availableCopy) {
            alert('Нет доступных экземпляров для бронирования');
            return;
        }
        
        // Отправляем запрос на сервер
        reserveBookOnServer(id, function(success) {
            if (success) {
                alert(`Книга "${book.title}" (Инв. № ${availableCopy.invNumber}) забронирована!`);
                showReaderBook(id);
            } else {
                alert('Ошибка бронирования');
            }
        });
    });
}

function showReaderForm() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page active">
            <button class="btn-back" onclick="renderApp()">← Назад</button>
            <div class="page-header">Мой формуляр</div>
            <div class="menu-item" onclick="showActiveBooks()">Активные книги на руках</div>
            <div class="menu-item" onclick="showReadingHistory()">История чтения</div>
            <div class="menu-item" onclick="showReaderReservations()">Бронирование</div>
            <div class="menu-item" style="background:#dc3545;" onclick="deleteAccount()">Удалить аккаунт</div>
        </div>
    `;
}

function showActiveBooks() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page active">
            <button class="btn-back" onclick="showReaderForm()">← Назад</button>
            <div class="page-header">Активные книги на руках</div>
            <div class="book-grid">
                <div class="book-card">
                    <img src="images/book1.webp">
                    <div class="book-title">Война и мир</div>
                    <div style="font-size:12px; color:#666;">Срок: 25.05.2024</div>
                </div>
                <div class="book-card">
                    <img src="images/book2.webp">
                    <div class="book-title">Преступление и наказание</div>
                    <div style="font-size:12px; color:#666;">Срок: 30.05.2024</div>
                </div>
            </div>
        </div>
    `;
}

function showReadingHistory() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page active">
            <button class="btn-back" onclick="showReaderForm()">← Назад</button>
            <div class="page-header">История чтения</div>
            <div class="book-grid">
                <div class="book-card">
                    <img src="images/three_musketeers.jpg">
                    <div class="book-title">Три мушкетера</div>
                    <div style="font-size:12px; color:#666;">Прочитано: 2023</div>
                </div>
                <div class="book-card">
                    <img src="images/nausea.jpg">
                    <div class="book-title">Тошнота</div>
                    <div style="font-size:12px; color:#666;">Прочитано: 2022</div>
                </div>
            </div>
        </div>
    `;
}

function showReaderReservations() {
    const app = document.getElementById('app');
    
    loadBooks(function(books) {
        const reserved = books.filter(b => b.status === 'reserved');
        app.innerHTML = `
            <div class="page active">
                <button class="btn-back" onclick="showReaderForm()">← Назад</button>
                <div class="page-header">Бронирование</div>
                <div class="reservation-grid">
                    ${reserved.map(b => `
                        <div class="reservation-item">
                            <img src="${b.cover}">
                            <div style="font-weight:bold;">${b.title}</div>
                            <div style="color:green; margin:5px 0;">Ожидает выдачи</div>
                            <button class="btn-primary small" onclick="cancelReservation(${b.id})">Отменить</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
}

function cancelReservation(id) {
    reserveBookOnServer(id, function(success) {
        if (success) {
            alert('Бронирование отменено');
            showReaderReservations();
        } else {
            alert('Ошибка отмены бронирования');
        }
    });
}

function showReaderEvents() {
    const app = document.getElementById('app');
    
    loadEvents(function(events) {
        app.innerHTML = `
            <div class="page active">
                <button class="btn-back" onclick="renderApp()">← Назад</button>
                <div class="page-header">Мои мероприятия</div>
                ${events.map(e => `
                    <div class="event-card">
                        <img src="${e.image}">
                        <div class="event-info">
                            <h4>${e.title}</h4>
                            <p>${e.date}</p>
                            <button class="btn-primary small" onclick="alert('Вы записаны!')">Вы записаны</button>
                            <button class="btn-primary small" onclick="alert('Запись отменена')">Отменить запись</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    });
}

// ============================================
// ИНТЕРФЕЙС БИБЛИОТЕКАРЯ
// ============================================

function renderLibrarianInterface() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page active">
            <div class="header-logo">
                <img src="images/logo.webp">
                <h1>Центральная городская библиотека</h1>
            </div>

            <div style="text-align:right; margin-bottom:10px;">
                <button class="btn-primary small" onclick="logout()">Выйти</button>
                <button class="btn-primary small" style="background:#dc3545;" onclick="deleteAccount()">Удалить аккаунт</button>
            </div>

            <div class="admin-grid">
                <button class="btn-primary" onclick="showReservationRequests()">Заявки на бронирование</button>
                <button class="btn-primary" onclick="showReadersList()">Читатели</button>
                <button class="btn-primary" onclick="showFund()">Фонд (экземпляры)</button>
                <button class="btn-primary" onclick="showAudit()">Журнал аудита</button>
                <button class="btn-primary" onclick="showReports()">Отчёты</button>
            </div>
        </div>
    `;
}

function filterLibrarianBooks() {
    const query = document.getElementById('searchInputLibrarian').value.toLowerCase();
    
    loadBooks(function(books) {
        const filtered = books.filter(b => 
            b.title.toLowerCase().includes(query) || 
            b.author.toLowerCase().includes(query)
        );
        
        // Обновляем сетку книг в фонде
        const tableBody = document.querySelector('.reader-table tbody');
        if (tableBody) {
            if (filtered.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Книги не найдены</td></tr>';
                return;
            }
            tableBody.innerHTML = filtered.map((b, i) => `
                <tr>
                    <td>INV-${String(i+1).padStart(3, '0')}</td>
                    <td>${b.title}</td>
                    <td>${b.author}</td>
                    <td>${b.status === 'available' ? 'В наличии' : 'Забронирована'}</td>
                    <td>Зал №1</td>
                </tr>
            `).join('');
        }
    });
}

function showReservationRequests() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page active">
            <button class="btn-back" onclick="renderApp()">← Назад</button>
            <div class="page-header">Заявки на бронирование</div>
            <div style="background:#2b4eff; color:white; border-radius:15px; padding:20px; margin:10px 0;">
                <div style="margin:10px 0; padding:10px; border-bottom:1px solid rgba(255,255,255,0.2);">
                    <strong>ID:</strong> 1<br>
                    <strong>Дата:</strong> 10.05.2024<br>
                    <strong>Читатель:</strong> Иванов И.И.<br>
                    <strong>Книга:</strong> Девяносто третий год<br>
                    <strong>Инвентарный номер:</strong> INV-001
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button class="btn-primary small" onclick="alert('Заявка подтверждена')">Подтвердить</button>
                        <button class="btn-primary small" onclick="alert('Заявка отклонена')">Отклонить</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showReadersList() {
    const app = document.getElementById('app');
    
    loadReaders(function(readers) {
        app.innerHTML = `
            <div class="page active">
                <button class="btn-back" onclick="renderApp()">← Назад</button>
                <div class="page-header">Читатели</div>
                <div class="search-bar">
                    <input id="searchReaderInput" placeholder="Введите имя читателя..." oninput="filterReaders()">
                    <span>🔍</span>
                </div>
                <div id="readerTableContainer">
                    <table class="reader-table">
                        <tr>
                            <th>ID</th>
                            <th>ФИО</th>
                            <th>Почта</th>
                            <th>Телефон</th>
                            <th>№ ЧБ</th>
                        </tr>
                        ${readers.map(r => `
                            <tr class="reader-row" data-name="${r.name.toLowerCase()}">
                                <td>${r.id}</td>
                                <td>${r.name}</td>
                                <td>${r.email}</td>
                                <td>${r.phone}</td>
                                <td>${r.card}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
                <div id="searchError" style="color:red; display:none; margin-top:10px;">Читатель не найден</div>
                <button class="btn-primary" onclick="showAddReader()">Добавить читателя</button>
            </div>
        `;
    });
}


function filterReaders() {
    const input = document.getElementById('searchReaderInput').value.toLowerCase();
    const rows = document.querySelectorAll('.reader-row');
    let found = false;

    rows.forEach(row => {
        const name = row.getAttribute('data-name');
        if (name.includes(input)) {
            row.style.display = '';
            found = true;
        } else {
            row.style.display = 'none';
        }
    });

    const errorDiv = document.getElementById('searchError');
    if (input.length > 0 && !found) {
        errorDiv.style.display = 'block';
    } else {
        errorDiv.style.display = 'none';
    }
}


function showAddReader() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page active">
            <button class="btn-back" onclick="showReadersList()">← Назад</button>
            <div class="page-header">Добавить читателя</div>
            <div style="max-width:400px; margin:0 auto;">
                <div style="margin-bottom:10px;">
                    <label style="display:block; margin-bottom:5px; font-weight:bold;">ФИО:</label>
                    <input id="newReaderName" placeholder="Введите ФИО" style="width:100%; padding:12px; background:#e0e0e0; border:none; border-radius:20px; font-size:14px;">
                </div>
                <div style="margin-bottom:10px;">
                    <label style="display:block; margin-bottom:5px; font-weight:bold;">Почта:</label>
                    <input id="newReaderEmail" placeholder="Введите почту" style="width:100%; padding:12px; background:#e0e0e0; border:none; border-radius:20px; font-size:14px;">
                </div>
                <div style="margin-bottom:10px;">
                    <label style="display:block; margin-bottom:5px; font-weight:bold;">Телефон:</label>
                    <input id="newReaderPhone" placeholder="Введите телефон" style="width:100%; padding:12px; background:#e0e0e0; border:none; border-radius:20px; font-size:14px;">
                </div>
                <button class="btn-primary" onclick="addReader()">Добавить</button>
            </div>
        </div>
    `;
}

function addReader() {
    const name = document.getElementById('newReaderName').value;
    const email = document.getElementById('newReaderEmail').value;
    const phone = document.getElementById('newReaderPhone').value;

    if (!name || !email || !phone) {
        alert("Пожалуйста, заполните все поля");
        return;
    }

    addReaderOnServer({ name, email, phone }, function(success) {
        if (success) {
            alert("Читатель успешно добавлен!");
            showReadersList();
        } else {
            alert("Ошибка добавления читателя");
        }
    });
}

function showFund() {
    const app = document.getElementById('app');
    
    loadBooks(function(books) {
        // Создаем список всех экземпляров
        let allCopies = [];
        books.forEach(book => {
            if (book.copies) {
                book.copies.forEach(copy => {
                    allCopies.push({
                        ...copy,
                        bookTitle: book.title,
                        bookAuthor: book.author
                    });
                });
            }
        });
        
        app.innerHTML = `
            <div class="page active">
                <button class="btn-back" onclick="renderApp()">← Назад</button>
                <div class="page-header">Фонд (все экземпляры)</div>
                <div class="search-bar">
                    <input id="searchInputFund" placeholder="Поиск по названию или автору..." oninput="filterFundBooks()">
                    <span>🔍</span>
                </div>
                <table class="reader-table">
                    <thead>
                        <tr>
                            <th>Инв. номер</th>
                            <th>Название</th>
                            <th>Автор</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody id="fundBooksContainer">
                        ${allCopies.map((copy, i) => `
                            <tr>
                                <td>${copy.invNumber}</td>
                                <td>${copy.bookTitle}</td>
                                <td>${copy.bookAuthor}</td>
                                <td>${getStatusDisplay(copy)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="btn-primary" onclick="alert('Форма добавления экземпляра')">Добавить экземпляр</button>
            </div>
        `;
    });
}

function filterFundBooks() {
    const query = document.getElementById('searchInputFund').value.toLowerCase();
    const container = document.getElementById('fundBooksContainer');
    
    loadBooks(function(books) {
        let allCopies = [];
        books.forEach(book => {
            if (book.copies) {
                book.copies.forEach(copy => {
                    if (book.title.toLowerCase().includes(query) || 
                        book.author.toLowerCase().includes(query)) {
                        allCopies.push({
                            ...copy,
                            bookTitle: book.title,
                            bookAuthor: book.author
                        });
                    }
                });
            }
        });
        
        if (allCopies.length === 0) {
            container.innerHTML = '<tr><td colspan="4" style="text-align:center;">Экземпляры не найдены</td></tr>';
            return;
        }
        
        container.innerHTML = allCopies.map(copy => `
            <tr>
                <td>${copy.invNumber}</td>
                <td>${copy.bookTitle}</td>
                <td>${copy.bookAuthor}</td>
                <td>${getStatusDisplay(copy)}</td>
            </tr>
        `).join('');
    });
}

function showAudit() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page active">
            <button class="btn-back" onclick="renderApp()">← Назад</button>
            <div class="page-header">Журнал аудита</div>
            <table class="reader-table">
                <tr>
                    <th>ID</th>
                    <th>Действие</th>
                    <th>Дата</th>
                    <th>Пользователь</th>
                </tr>
                <tr><td>1</td><td>Вход в систему</td><td>10.05.2024 10:30</td><td>Иванов И.И.</td></tr>
                <tr><td>2</td><td>Бронирование книги</td><td>10.05.2024 11:00</td><td>Петрова А.С.</td></tr>
                <tr><td>3</td><td>Выдача книги</td><td>10.05.2024 11:15</td><td>Библиотекарь</td></tr>
            </table>
        </div>
    `;
}

function showReports() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page active">
            <button class="btn-back" onclick="renderApp()">← Назад</button>
            <div class="page-header">Отчёты</div>
            <div class="menu-item" onclick="alert('Отчёт по читателям')">Отчёт по читателям</div>
            <div class="menu-item" onclick="alert('Отчёт по книгам')">Отчёт по книгам</div>
            <div class="menu-item" onclick="alert('Отчёт по мероприятиям')">Отчёт по мероприятиям</div>
        </div>
    `;
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function logout() {
    currentUser = null;
    currentPage = 'role-select';
    renderApp();
}

function goToRegister() {
    currentPage = 'register';
    renderApp();
}

function goToRoleSelect() {
    currentPage = 'role-select';
    renderApp();
}

// ============================================
// ГЛОБАЛЬНАЯ ФУНКЦИЯ ВХОДА
// ============================================

window.performLogin = function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert("Пожалуйста, заполните все поля");
        return;
    }

    // Ищем пользователя по email (пароль не проверяем, так как его нет в массиве)
    const user = users.find(u => u.email === email);
    
    if (!user) {
        alert("Неверный email или пароль");
        return;
    }

    currentUser = { 
        name: user.name, 
        email: user.email, 
        role: user.role === "Администратор" ? "librarian" : "reader" 
    };
    currentPage = 'app';
    renderApp();
};

// ============================================
// ГЛОБАЛЬНАЯ ФУНКЦИЯ РЕГИСТРАЦИИ
// ============================================

window.performRegister = function() {
    console.log("Функция performRegister() вызвана!");
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (!name || !email || !password) {
        alert("Пожалуйста, заполните все поля");
        return;
    }

    if (password.length < 8) {
        alert("Пароль должен быть не менее 8 символов");
        return;
    }

    // Проверяем, не занят ли email
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        alert("Пользователь с таким email уже существует");
        return;
    }

    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        role: "Читатель"
    };
    users.push(newUser);

    currentUser = {
        name: name,
        email: email,
        role: "reader"
    };
    currentPage = 'app';
    renderApp();

    alert("Регистрация успешна! Добро пожаловать!");
};

// ============================================
// ФУНКЦИЯ УДАЛЕНИЯ АККАУНТА
// ============================================

function deleteAccount() {
    const confirmation = confirm("Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить.");
    
    if (!confirmation) {
        return;
    }
    
    const passwordConfirmation = prompt("Введите ваш пароль для подтверждения:");
    if (!passwordConfirmation) {
        return;
    }
    
    // Проверяем пароль
    const user = users.find(u => u.email === currentUser.email);
    if (!user) {
        alert("Ошибка: пользователь не найден");
        return;
    }
    
    if (user.password !== passwordConfirmation) {
        alert("Неверный пароль");
        return;
    }
    
    // Удаляем пользователя
    const index = users.indexOf(user);
    if (index !== -1) {
        users.splice(index, 1);
    }
    
    // Выходим из системы
    alert("Аккаунт успешно удален");
    logout();
}

// ============================================
// ЗАПУСК ПРИЛОЖЕНИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    renderApp();
});

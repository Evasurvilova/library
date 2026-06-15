function loadPage(page) {
    const main = document.getElementById('content');
    switch(page) {
        case 'home': 
            main.innerHTML = `<h1>Добро пожаловать в библиотеку</h1>
                              <p>Здесь вы найдете лучшие книги.</p>
                              <button class="btn-primary" onclick="loadPage('catalog')">Перейти в каталог</button>`;
            break;
        case 'catalog':
            let html = '<h2>Каталог книг</h2><div class="row">';
            books.forEach(book => {
                html += `<div class="book-card">
                            <img src="${book.cover}" alt="${book.title}">
                            <div class="book-title">${book.title}</div>
                            <div>${book.author}</div>
                            <button class="btn-primary" onclick="alert('Книга добавлена в корзину!')">Взять</button>
                        </div>`;
            });
            html += '</div>';
            main.innerHTML = html;
            break;
        case 'profile':
            main.innerHTML = `<h2>Личный кабинет</h2>
                              <p>Имя: ${users[0].name}</p>
                              <p>Email: ${users[0].email}</p>
                              <p>Роль: ${users[0].role}</p>
                              <button class="btn-primary" onclick="alert('Выход...')">Выйти</button>`;
            break;
        case 'admin':
            let adminHtml = `<h2>Панель администратора</h2>
                             <table class="admin-table">
                                 <tr><th>ID</th><th>Название</th><th>Автор</th><th>Действие</th></tr>`;
            books.forEach(b => {
                adminHtml += `<tr><td>${b.id}</td><td>${b.title}</td><td>${b.author}</td>
                              <td><button onclick="alert('Редактирование ${b.title}')">✏️</button></td></tr>`;
            });
            adminHtml += '</table>';
            main.innerHTML = adminHtml;
            break;
        default:
            main.innerHTML = '<h1>404 Страница не найдена</h1>';
    }
}

// Загрузка по умолчанию
loadPage('home');
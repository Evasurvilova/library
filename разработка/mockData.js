const books = [
    { 
        id: 1, 
        title: "Война и мир", 
        author: "Л. Толстой", 
        year: 1869, 
        cover: "images/book1.webp",
        copies: [
            { invNumber: "INV-001", status: "available" },
            { invNumber: "INV-002", status: "reserved" },
            { invNumber: "INV-003", status: "occupied", returnDate: "15.06.2026" }
        ]
    },
    { 
        id: 2, 
        title: "Преступление и наказание", 
        author: "Ф. Достоевский", 
        year: 1866, 
        cover: "images/book2.webp",
        copies: [
            { invNumber: "INV-004", status: "available" },
            { invNumber: "INV-005", status: "restoration" }
        ]
    },
    { 
        id: 3, 
        title: "Мастер и Маргарита", 
        author: "М. Булгаков", 
        year: 1966, 
        cover: "images/book3.webp",
        copies: [
            { invNumber: "INV-006", status: "available" }
        ]
    },
    { 
        id: 4, 
        title: "1984", 
        author: "Дж. Оруэлл", 
        year: 1949, 
        cover: "images/book4.webp",
        copies: [
            { invNumber: "INV-007", status: "occupied", returnDate: "20.06.2026" },
            { invNumber: "INV-008", status: "restoration" }
        ]
    }
];

const users = [
    { id: 1, name: "Иван Петров", email: "ivan@mail.ru", password: "12345678", role: "Читатель" },
    { id: 2, name: "Админ Главный", email: "admin@library.ru", password: "87654321", role: "Администратор" }
];
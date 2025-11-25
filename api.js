const allUsers = [
    { firstname: 'Іван', lastname: 'Коваленко', score: 85 },
    { firstname: 'Марія', lastname: 'Мельник', score: 92 },
    { firstname: 'Петро', lastname: 'Шевченко', score: 78 },
    { firstname: 'Анна', lastname: 'Смирнова', score: 95 },
    { firstname: 'Олег', lastname: 'Ткаченко', score: 88 },
    { firstname: 'Юлія', lastname: 'Попова', score: 75 },
    { firstname: 'Василь', lastname: 'Бондаренко', score: 90 },
    { firstname: 'Наталія', lastname: 'Марченко', score: 81 },
    { firstname: 'Дмитро', lastname: 'Клименко', score: 89 },
    { firstname: 'Софія', lastname: 'Лисенко', score: 93 },
    { firstname: 'Андрій', lastname: 'Савчук', score: 77 },
    { firstname: 'Олена', lastname: 'Федорова', score: 84 },
    { firstname: 'Михайло', lastname: 'Волошин', score: 91 },
    { firstname: 'Ірина', lastname: 'Павленко', score: 86 },
    { firstname: 'Тарас', lastname: 'Захарчук', score: 79 },
    { firstname: 'Христина', lastname: 'Григоренко', score: 94 },
    { firstname: 'Богдан', lastname: 'Олійник', score: 80 },
    { firstname: 'Вікторія', lastname: 'Кузьменко', score: 87 },
    { firstname: 'Гліб', lastname: 'Руденко', score: 76 },
    { firstname: 'Катерина', lastname: 'Кравченко', score: 96 }
];

function fetchUsers() {
    return new Promise(resolve => {
        setTimeout(() => {
            const shuffled = [...allUsers].sort(() => 0.5 - Math.random());
            const randomUsers = shuffled.slice(0, 10);
            resolve(randomUsers);
        }, 1000);
    });
}

function getNewUsers() {
    return allUsers.slice(0, 5);
}

function getCurrentUsersCount() {
    return Math.floor(Math.random() * 50) + 10;
}
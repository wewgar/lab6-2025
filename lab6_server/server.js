
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;


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


app.use(express.static(path.join(__dirname, 'public')));


app.get('/api/users', (req, res) => {

    setTimeout(() => {
        const shuffled = allUsers.sort(() => 0.5 - Math.random());
        res.json(shuffled.slice(0, 10));
    }, 1000);
});


app.get('/api/new-users', (req, res) => {
    res.json(allUsers.slice(0, 5));
});


app.get('/api/users/sort', (req, res) => {
    const { column, direction } = req.query;


    if (!column || !direction || !['firstname', 'lastname', 'score'].includes(column)) {
        return res.status(400).json({ error: 'Некоректні параметри сортування.' });
    }

    let sortedUsers = [...allUsers];

    sortedUsers.sort((a, b) => {
        const valA = a[column];
        const valB = b[column];

        let comparison = 0;

        if (typeof valA === 'string') {

            comparison = valA.localeCompare(valB, 'uk', { sensitivity: 'base' });
        } else {

            comparison = valA - valB;
        }


        return direction === 'desc' ? comparison * -1 : comparison;
    });

    res.json(sortedUsers);
});


app.get('/api/gallery', (req, res) => {

    const galleryPath = path.join(__dirname, 'public', 'gallery');

    fs.readdir(galleryPath, (err, files) => {
        if (err) {
            console.error('Error reading gallery:', err);

            return res.status(500).json({ error: 'Не вдалося прочитати папку галереї.' });
        }


        const images = files.filter(file => /\.(jpe?g|png|gif|svg)$/i.test(file));
        res.json(images);
    });
});


app.get('/weather', (req, res) => {

    const temperature = Math.floor(Math.random() * 31);

    res.json({
        city: 'Kyiv',
        temperature: temperature
    });
});



app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
    console.log(`Тестова сторінка: http://localhost:${port}/index.html`);
});
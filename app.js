const express = require('express');
const app = express();
const path = require('node:path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('home');
});

app.listen(3000, () => console.log('http://localhost:3000'));
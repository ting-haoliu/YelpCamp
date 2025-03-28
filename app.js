require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const path = require('node:path');
const ejsMate = require('ejs-mate'); // used for layout
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override'); // HTML just support Get and POST

const ExpressError = require('./utils/ExpressError');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


const databaseUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(databaseUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret', // String used to sign the session ID
    resave: false, // Whether to force session resaving on every request, even if not modified
    saveUninitialized: true, // Whether to store uninitialized sessions
    cookie: {
        httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript (improves security)
        maxAge: 1000 * 60 * 60 * 24 * 7, // Set session expiration time (7 days in milliseconds)
    }
}
app.use(session(sessionConfig));

app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Router
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
    res.render('home');
});

// It will appear when there is no function matched
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Something went wrong';
    }

    res.status(statusCode).render('error', { err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
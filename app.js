const express = require('express');
const app = express();
const port = 3010;
const path = require('path');
const middleware = require('./middleware');
const bodyParser = require('body-parser');
const db = require('./database');
const session = require('express-session');

const server = app.listen(port, () =>
    console.log('Server listening on port ' + port)
);

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: 'post chit',
        resave: true,
        saveUninitialized: false
    })
);

// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const signoutRoute = require('./routes/signoutRoutes');

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/signout', signoutRoute);

app.get('/', middleware.requireLogin, (req, res, next) => {
    let payload = {
        pageTitle: 'Home',
        userLoggedIn: req.session.user
    };

    res.status(200).render('home', payload);
});
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
const io = require('socket.io')(server, { pingTimeout: 60000 });

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: 'post chit',
        resave: true,
        saveUninitialized: false,
    })
);

// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const signoutRoute = require('./routes/signoutRoutes');
const postRoute = require('./routes/postRoutes');
const profileRoute = require('./routes/profileRoutes');
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
const messagesRoute = require('./routes/msgRoutes');
const notificationsRoute = require('./routes/notificationRoutes');

// Api Routes
const postsApiRoute = require('./routes/api/postsApi');
const usersApiRoute = require('./routes/api/usersApi');
const chatsApiRoute = require('./routes/api/chatsApi');
const messagesApiRoute = require('./routes/api/MsgApi');
const notificationsApiRoute = require('./routes/api/notificationApi');

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/signout', signoutRoute);
app.use('/posts', middleware.requireLogin, postRoute);
app.use('/profile', middleware.requireLogin, profileRoute);
app.use('/uploads', uploadRoute);
app.use('/search', middleware.requireLogin, searchRoute);
app.use('/messages', middleware.requireLogin, messagesRoute);
app.use('/notifications', middleware.requireLogin, notificationsRoute);

app.use('/api/posts', postsApiRoute);
app.use('/api/users', usersApiRoute);
app.use('/api/chats', chatsApiRoute);
app.use('/api/messages', messagesApiRoute);
app.use('/api/notifications', notificationsApiRoute);

app.get('/', middleware.requireLogin, (req, res, next) => {
    let payload = {
        pageTitle: 'Home',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    };

    res.status(200).render('home', payload);
});

io.on('connection', (socket) => {
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
    });

    socket.on('join room', (room) => socket.join(room));
    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));
    socket.on('notification received', (room) => socket.in(room).emit('notification received'));

    socket.on('new message', (newMessage) => {
        let chat = newMessage.chat;

        if (!chat.users) return console.log('Chat.users are not defined');

        chat.users.forEach((user) => {
            if (user._id == newMessage.sender._id) return;
            socket.in(user._id).emit('message received', newMessage);
        });
    });
});

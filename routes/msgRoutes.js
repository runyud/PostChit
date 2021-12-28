const express = require('express');
const router = express.Router();
const User = require('../schemas/UserSchema');

router.get('/', (req, res) => {
    let payload = {
        pageTitle: 'Inbox',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    };

    res.status(200).render('inboxPage', payload);
});

router.get('/new', (req, res) => {
    let payload = {
        pageTitle: 'New message',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    };

    res.status(200).render('newMessage', payload);
});

module.exports = router;

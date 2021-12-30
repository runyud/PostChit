const express = require('express');
const router = express.Router();
const User = require('../schemas/UserSchema');
const mongoose = require('mongoose');
const Chat = require('../schemas/ChatSchema');

router.get('/', (req, res) => {
    let payload = {
        pageTitle: 'Notifications',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    };

    res.status(200).render('notificationsPage', payload);
});


module.exports = router;

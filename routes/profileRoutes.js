const express = require('express');
const router = express.Router();
const User = require('../schemas/UserSchema');

router.get('/', (req, res) => {
    let payload = {
        pageTitle: req.session.user.userName,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user,
    };

    res.status(200).render('profilePage', payload);
});

router.get('/:username', async (req, res) => {
    let payload = await getPayload(req.params.username, req.session.user);

    res.status(200).render('profilePage', payload);
});

router.get('/:username/replies', async (req, res) => {
    let payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = 'replies';
    res.status(200).render('profilePage', payload);
});

router.get('/:username/following', async (req, res) => {
    let payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = 'following';
    res.status(200).render('followersAndFollowing', payload);
});

router.get('/:username/followers', async (req, res) => {
    let payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = 'followers';
    res.status(200).render('followersAndFollowing', payload);
});

async function getPayload(username, userLoggedIn) {
    let user = await User.findOne({ userName: username });

    if (user == null) {
        let ObjectId = require('mongoose').Types.ObjectId
        if (!ObjectId.isValid(username)) {
            return {
                pageTitle: 'User not found',
                userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn),
            }
        }
        user = await User.findById(username)
        if (user == null) {
            return {
                pageTitle: 'User not found',
                userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn),
            }
        }
    }

    return {
        pageTitle: user.userName,
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user,
    };
}
module.exports = router;

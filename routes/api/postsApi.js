const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res, next) => {
    Post.find()
        .populate('postedBy')
        .populate('shareData')
        .sort({ createdAt: -1 })
        .then(async (results) => {
            results = await User.populate(results, {
                path: 'shareData.postedBy',
            });
            res.status(200).send(results);
        })
        .catch((error) => {
            console.log(error);
            res.sendStatus(400);
        });
});

router.post('/', async (req, res, next) => {
    if (!req.body.content) {
        console.log('Content param not sent with request');
        res.sendStatus(400);
        return;
    }

    let postData = {
        content: req.body.content,
        postedBy: req.session.user,
    };

    Post.create(postData)
        .then(async (newPost) => {
            newPost = await User.populate(newPost, { path: 'postedBy' });
            res.status(201).send(newPost);
        })
        .catch((error) => {
            console.log(error);
            res.sendStatus(400);
        });
});

router.put('/:postId/like', async (req, res, next) => {
    let postId = req.params.postId;
    let userId = req.session.user._id;

    let isLiked =
        req.session.user.likes && req.session.user.likes.includes(postId);

    let option = isLiked ? '$pull' : '$addToSet';

    // Insert user likes
    req.session.user = await User.findByIdAndUpdate(
        userId,
        { [option]: { likes: postId } },
        { new: true }
    ).catch((error) => {
        console.log(error);
        res.sendStatus(400);
    });

    // Insert post likes
    let post = await Post.findByIdAndUpdate(
        postId,
        { [option]: { likes: userId } },
        { new: true }
    ).catch((error) => {
        console.log(error);
        res.sendStatus(400);
    });

    res.status(200).send(post);
});

router.post('/:postId/share', async (req, res, next) => {
    let postId = req.params.postId;
    let userId = req.session.user._id;

    // try and delete shares
    let deletedPost = await Post.findOneAndDelete({
        postedBy: userId,
        shareData: postId,
    }).catch((error) => {
        console.log(error);
        res.sendStatus(400);
    });

    let option = deletedPost != null ? '$pull' : '$addToSet';

    let repost = deletedPost;

    if (repost == null) {
        repost = await Post.create({
            postedBy: userId,
            shareData: postId,
        }).catch((error) => {
            console.log(error);
            res.sendStatus(400);
        });
    }

    // Insert user shares
    req.session.user = await User.findByIdAndUpdate(
        userId,
        { [option]: { shares: repost._id } },
        { new: true }
    ).catch((error) => {
        console.log(error);
        res.sendStatus(400);
    });

    // Insert post shares
    let post = await Post.findByIdAndUpdate(
        postId,
        { [option]: { shareUsers: userId } },
        { new: true }
    ).catch((error) => {
        console.log(error);
        res.sendStatus(400);
    });

    res.status(200).send(post);
});

module.exports = router;

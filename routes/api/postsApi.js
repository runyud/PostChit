const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.get('/', async (req, res, next) => {
    let results = await getPosts({});
    res.status(200).send(results);
});

router.get('/:id', async (req, res, next) => {
    let postId = req.params.id;

    let postData = await getPosts({ _id: postId });
    postData = postData[0];

    var results = {
        postData: postData,
    };

    if (postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo;
    }

    results.replies = await getPosts({ replyTo: postId });

    res.status(200).send(results);
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

    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }

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

async function getPosts(filter) {
    let results = await Post.find(filter)
        .populate('postedBy')
        .populate('shareData')
        .populate('replyTo')
        .sort({ createdAt: -1 })
        .catch((error) => {
            console.log(error);
            res.sendStatus(400);
        });
    results = await User.populate(results, {
        path: 'replyTo.postedBy',
    });
    return await User.populate(results, {
        path: 'shareData.postedBy',
    });
}

module.exports = router;

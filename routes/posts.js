const {Router} = require('express');
const Post = require('../models/post');

const router = new Router();

router.get('/post/create', (req, res) => {
    res.render('pages/posts/create', {
        title: 'Новый пост',
        tags: [
            {
                label: 'Спорт',
                value: 'sport',
                color: ''
            },
            {
                label: 'Технологии',
                value: 'tech',
                color: '',
            },
            {
                label: 'Искусство',
                value: 'art',
            },
            {
                label: 'Новости',
                value: 'news',
            },
            {
                label: 'Мероприятия',
                value: 'actions',
            },
        ],
        isPostPage: true,
    });
})

router.get('/recent-posts', async (req, res, next) => {
    const limit  = req.query.limit || 10;
    const page = req.query.page || 1;

    const total_posts = page * limit 

    const posts = await Post.find().populate('author').sort({
        created_at: -1,
    }).limit(total_posts);

    if(!posts.length) {
        res.status(404).json({
            message: 'posts|not_found',
        });
        return
    }

    console.log(posts.map(({
        title,
        body,
        author,
        rates,
        tags,
        _id
    }) => ({
        title,
        tags,
        rates,
        body,
        author,
        id: _id
    })).filter((_, index) => index >= (page - 1) * limit && page < (page * limit - 1)));

    res.render(
        'pages/posts/index.hbs',
        {
            message: 'OK',
            posts: posts.map(({
                title,
                body,
                author,
                rates,
                tags,
                _id
            }) => ({
                title,
                tags,
                rates,
                body,
                author,
                id: _id
            })).filter((_, index) => index >= (page - 1) * limit && page < (page * limit - 1)),
        },
    );
})

router.get('/post/:id', async (req, res, next) => {
    const post = await Post.findOne({_id: req.params.id});
    if(!post) {
        res.status(404).json({
            message: "post|not_found",
        })
        return next();
    }

    res.json({
        message: 'OK',
        post,
    })
})

router.post('/post/create', async (req, res, next) => {
    const {title, body, tags} = req.body;

    const post = new Post({
        title,
        body,
        author: req.session.uid,
        tags,
    });

    try {
        await post.save();
        res.json({
            message: "OK",
            post_id: post._id,
        })
    } catch(e) {
        console.log("ERROR ON SAVING NEW POST: \n", e);
    }

    next();
})

module.exports = router;
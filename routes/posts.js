const { Router } = require('express');
const Post = require('../models/post');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');

const router = new Router();

const tags = [
    {
        label: 'Спорт',
        value: 'sport',
        color: '#15c7ef'
    },
    {
        label: 'Технологии',
        value: 'tech',
        color: '#154eef',
    },
    {
        label: 'Искусство',
        value: 'art',
        color: '#ef1529'
    },
    {
        label: 'Новости',
        value: 'news',
        color: '#eccb27',
    },
    {
        label: 'Мероприятия',
        value: 'actions',
        color: '#fd8cc0',
    },
];

router.get('/post/create', authMiddleware, (req, res) => {
    res.render('pages/posts/create', {
        title: 'Новый пост',
        tags,
        isPostPage: true,
    });
})

router.get('/recent-posts', async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const total_posts = page * limit

    const posts = await Post.find().populate('author').sort({
        created_at: -1,
    }).limit(total_posts);

    if (!posts.length) {
        res.status(404).json({
            message: 'posts|not_found',
        });
        return
    }

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
                cover,
                _id
            }) => ({
                title,
                tags,
                rate: rates.reduce((sum, value) => sum += value, 0) / rates.length || 0,
                body: body.length > 160 ? body.substring(0, 120) + '...' : body,
                author: {
                    name: author.name,
                    surname: author.surname,
                    nickname: author.nickname,
                },
                cover,
                link: `http://${process.env.HOSTNAME}/post/${_id}`,
                id: _id
            })).filter((_, index) => index >= (page - 1) * limit && page < (page * limit - 1)),
        },
    );
})

router.get('/post/:id', async (req, res, next) => {
    const post = await Post.findOne({ _id: req.params.id }).populate('author');
    if (!post) {
        res.status(404).json({
            message: "post|not_found",
        })
        return next();
    }

    res.render('pages/posts/single', {
        post: {
            title: post.title,
            body: post.body,
            cover: post.cover,
            author: {
                name: post.author.name,
                surname: post.author.surname,
                nickname: post.author.nickname,
            },
            rate: post.rates.reduce((sum, { rate }) => sum += rate, 0)
        },
    })
})

router.get('/post/edit/:id', authMiddleware, async (req, res, next) => {
    const post = await Post.findOne({ _id: req.params.id }).populate('author');
    if (!post) {
        res.status(404).json({
            message: "post|not_found",
        })
        return next();
    }
    console.log(post.tags.map(({ value }) => value))
    res.render('pages/posts/edit', {
        post: {
            title: post.title,
            body: post.body,
            cover: post.cover,
            tags: post.tags.map(({ value }) => value),
            rate: post.rates.reduce((sum, { rate }) => sum += rate, 0)
        },
        tags,
    })
})

router.post('/post/create', authMiddleware, async (req, res, next) => {
    const { title, body, tags: formTags, cover } = req.body;

    const post = new Post({
        title,
        body,
        author: req.session.uid,
        tags: formTags.map(tag => tags.find(t => t.value === tag)),
        cover
    });

    try {
        await post.save();
        const user = await User.findById(req.session.uid)
        user.posts = user.posts.concat(post._id);
        await user.save();
        res.json({
            message: "OK",
            post_id: post._id,
        })
    } catch (e) {
        res.status(500).json({
            message: "posts|unable_to_save",
        })
        console.log("ERROR ON SAVING NEW POST: \n", e);
    }

    next();
})

router.get('/blog', authMiddleware, async (req, res, next) => {
    const user = await User.findById(req.session.uid).populate('posts');
    console.log(user.posts.reduce((sum, post) => {
        if (post.rates.langth === 0) return 0
        return sum + post.rates.reduce((sum, { rate }) => sum + rate, 0) / post.rates.length
    }, 0) / user.posts.length)
    res.render('pages/posts/blog.hbs', {
        user: {
            name: user.name,
            surname: user.surname,
            nickname: user.nickname,
            posts: user.posts.map(post => ({ title: post.title, body: post.body, cover: post.cover, tags: post.tags })),
            average_rate: user.posts.reduce((sum, post) => {
                if (post.rates.langth === 0) return 0
                return sum + post.rates.reduce((sum, { rate }) => sum + rate, 0) / post.rates.length
            }, 0) / user.posts.length || 0,
            posts_amount: user.posts.length
        },
    })
});

module.exports = router;
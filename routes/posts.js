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

// ----- POST CREATION AND EDITING

router.get('/post/create', authMiddleware, (req, res) => {
    res.render('pages/posts/create', {
        title: 'Новый пост',
        tags,
        isPostPage: true,
    });
})

router.get('/post/edit/:id', authMiddleware, async (req, res, next) => {
    const post = await Post.findOne({
        _id: req.params.id
    }).populate('author');

    if (req.session.id !== post.author._id) return res.redirect('/error?status=403')

    if (!post) {
        res.status(404).json({
            message: "post|not_found",
        })
        return next();
    }

    res.render('pages/posts/edit', {
        post: {
            title: post.title,
            body: post.body,
            cover: post.cover,
            tags: post.tags.map(({
                value
            }) => value),
            rate: post.rates.reduce((sum, {
                rate
            }) => sum += rate, 0)
        },
        tags,
    })
})

router.post('/post/create', authMiddleware, async (req, res, next) => {
    const {
        title,
        body,
        tags: formTags,
        cover
    } = req.body;

    const post = new Post({
        title,
        body,
        author: req.session.uid,
        tags: formTags.map(tag => tags.find(t => t.value === tag)),
        cover,
        created_at: new Date().getTime(),
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

router.patch('/post/:id', authMiddleware, async (req, res, next) => {
    const {
        title,
        body,
        tags: formTags,
        cover
    } = req.body;
    const post = await Post.findById(req.params.id);

    if (req.session.id !== post.author._id) return res.status(403).send({
        message: 'You don\'t have access to this page'
    })

    post.title = title;
    post.body = body;
    post.tags = formTags.map(tag => tags.find(t => t.value === tag));
    post.cover = cover;

    try {
        await post.save();
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


//  ----- POSTS READING ------

router.get('/recent-posts', async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const posts = await Post
        .find()
        .populate('author')
        .skip((page - 1)*limit)
        .limit(limit)
        .sort({
            created_at: -1,
        });

    if (!posts.length) {
        res.status(404).json({
            message: 'posts|not_found',
        });
        return next();
    }

    res.render(
        'pages/posts/index.hbs',
        {
            title: 'Последние посты',
            pages: Array.from(Array(Math.ceil(await Post.countDocuments({}, (err, count) => {
                if (err) return res.status(500).json({
                    message: 'posts|count',
                    error: err,
                })
                return count
            }) / limit)), (_, index) => index + 1),
            posts: posts.map((post) => ({
                title: post.title,
                tags: post.tags,
                rate: post.rates.reduce((sum, value) => sum += value, 0) / rates.length || 0,
                body: post.body.length > 160 ? body.substring(0, 120) + '...' : body,
                author: {
                    name: author.name,
                    surname: author.surname,
                    nickname: author.nickname,
                },
                cover: post.cover,
                link: `http://${process.env.HOSTNAME}/post/${_id}`,
                id: post._id
            })),
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
            link: `http://${process.env.HOSTNAME}/post/${post._id}`,
            author: {
                name: post.author.name,
                surname: post.author.surname,
                nickname: post.author.nickname,
            },
            rate: post.rates.reduce((sum, { rate }) => sum += rate, 0)
        },
    })
})



router.get('/blog', authMiddleware, async (req, res, next) => {
    const user = await User.findById(req.session.uid).populate('posts');

     const userParsed = {
         name: user.name,
         surname: user.surname,
         nickname: user.nickname,
         posts: [],
         average_rate: 0,
         posts_amount: user.posts.length
     };

    userParsed.posts = user.posts.reverse().map(post => ({
        title: post.title,
        body: post.body.length > 120 ?
            post.body.substring(0, 120) + '...' :
            post.body,
        cover: post.cover,
        tags: post.tags,
        rate: post.rates.reduce((sum, {
            rate
        }) => sum + rate, 0),
        link: `http://${process.env.HOSTNAME}/post/${post._id}`,
    }));

    userParsed.average_rate = user.posts.reduce((sum, post) => {
        if (post.rates.langth === 0) return 0
        return sum + post.rates.reduce((sum, {
            rate
        }) => sum + rate, 0) / post.rates.length
    }, 0) / user.posts.length || 0;

    res.render('pages/posts/blog.hbs', {
        isBlog: true,
        title: `Блог | ${user.name} ${user.surname}`, 
        user: userParsed,
    })
});

module.exports = router;
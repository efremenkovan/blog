const { Router } = require('express');
const Post = require('../models/post');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
const { tags } = require('../localdata/posts');
const post = require('../models/post');

const router = new Router();


// ----- POST CREATION AND EDITING

router.get('/post/create', authMiddleware, (req, res) => {
    res.render('pages/posts/create', {
        title: 'Новый пост',
        tags,
        isPostPage: true,
        isPostCreatePage: true,
    });
})

router.get('/post/edit/:id', authMiddleware, async (req, res, next) => {
    const post = await Post.findOne({
        _id: req.params.id
    }).populate('author');

    if (req.session.uid != post.author._id.toString()) return res.redirect('/error?status=403')

    if (!post) {
        res.status(404).json({
            message: 'post|not_found',
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
            }) => sum += rate, 0),
            id: post._id,
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
            message: 'OK',
            post_id: post._id,
        })
    } catch (e) {
        res.status(500).json({
            message: 'posts|unable_to_save',
        })
        console.log('ERROR ON SAVING NEW POST: \n', e);
    }

    next();
})

router.put('/post/:id', authMiddleware, async (req, res, next) => {
    const {
        title,
        body,
        tags: formTags,
        cover
    } = req.body;
    const post = await Post.findById(req.params.id);

    if (req.session.uid != post.author._id.toString()) return res.status(403).send({
        message: 'You don\'t have access to this page'
    })

    post.title = title;
    post.body = body;
    post.tags = formTags.map(tag => tags.find(t => t.value === tag));
    post.cover = cover;

    try {
        await post.save();
        res.json({
            message: 'OK',
            post_id: post._id,
        })
    } catch (e) {
        res.status(500).json({
            message: 'posts|unable_to_save',
        })
        console.log('ERROR ON SAVING NEW POST: \n', e);
    }

    next();
})

router.delete('/post/:id', authMiddleware, async (req, res, next) => {
    const {
        title,
        body,
        tags: formTags,
        cover
    } = req.body;
    const post = await Post.findById(req.params.id);

    if (req.session.uid != post.author._id.toString()) return res.status(403).send({
        message: 'You don\'t have access to this page'
    })

    try {
        await post.remove()
        res.json({
            message: 'OK',
        })
    } catch (e) {
        res.status(500).json({
            message: 'posts|unable_to_save',
        })
        console.log('ERROR ON SAVING NEW POST: \n', e);
    }

    next();
})


router.post('/post/:id', authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.session.uid);
        user.saved_posts.includes(req.params.id)
            ? user.saved_posts = user.saved_posts.filter(id => id != req.params.id)
            : user.saved_posts = [...user.saved_posts, req.params.id];
        await user.save();

        res.json({
            message: 'OK'
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'post|mark',
        })
    }
})

router.post('/post/rate/:id', authMiddleware, async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    // console.log(post.rates[0].user == req.session.uid, post.rates[0].user, req.session.uid)
    let result = post.rates.find(({ user }) => user == req.session.uid)
    if (result) {
        post.rates = [...post.rates.filter(({ user }) => user != req.session.uid), {
            rate: parseInt(req.query.rate),
            user: req.session.uid
        }]
    } else {
        post.rates = [...post.rates, {
            rate: parseInt(req.query.rate),
            user: req.session.uid
        }]
    }

    try {
        await post.save();
        res.json({ message: 'OK' })
    } catch (e) {
        console.log(e);
        res.json({ message: 'post|save_rate', error: e })
    }

})

//  ----- POSTS READING ------

router.get('/recent-posts', async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const currentUser = await User.findById(req.session.uid);

    let posts = await Post
        .find()
        .populate('author')
        .skip((page - 1) * limit)
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

    const pages = Array.from(Array(Math.ceil(await Post.countDocuments({}, (err, count) => {
        return err
            ? res.status(500).json({
                message: 'posts|count',
                error: err,
            })
            : count
    }) / limit)), (_, index) => index + 1)

    posts = posts.map((post) => ({
        title: post.title,
        tags: post.tags,
        rate: post.rates.reduce((sum, value) => sum += value, 0) / post.rates.length || 0,
        body: post.body.length > 160
            ? post.body.substring(0, 120) + '...'
            : post.body,
        author: {
            name: post.author.name,
            surname: post.author.surname,
            nickname: post.author.nickname,
        },
        isUserPost: req.session.uid == post.author._id.toString(),
        isSaved: currentUser.saved_posts.includes(post._id),
        cover: post.cover,
        link: `http://${process.env.HOSTNAME}/post/${post._id}`,
        id: post._id
    }))

    res.render(
        'pages/posts/index.hbs',
        {
            title: 'Последние посты',
            pages,
            posts,
            active_page: page,
            isRecentPostsPage: true,
        },
    );
})

router.get('/post/:id', async (req, res, next) => {
    const post = await Post.findOne({ _id: req.params.id }).populate('author');
    if (!post) {
        res.status(404).json({
            message: 'post|not_found',
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
            canVote: !!(req.session.isAuthenticated && !post.rates.find(({ user }) => user.toString() == req.session.uid)),
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
        isSaved: user.saved_posts.includes(post._id),
        isUserPost: true,
        link: `http://${process.env.HOSTNAME}/post/${post._id}`,
        id: post._id,
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

router.get('/saved-posts', async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const user = await User.findById(req.session.uid).populate('saved_posts');
    let posts = user.saved_posts.reverse()

    const startIndex = (page - 1) * limit;
    const lastIndex = startIndex + limit;
    posts = posts.slice(startIndex, lastIndex)

    if (!posts.length) {
        res.status(404).json({
            message: 'posts|not_found',
        });
        return next();
    }

    const pages = Array.from(Array(Math.ceil(posts.length / limit)), (_, index) => index + 1)

    posts = posts.map((post) => ({
        title: post.title,
        tags: post.tags,
        rate: post.rates.reduce((sum, value) => sum += value, 0) / post.rates.length || 0,
        body: post.body.length > 160
            ? post.body.substring(0, 120) + '...'
            : post.body,
        author: {
            name: post.author.name,
            surname: post.author.surname,
            nickname: post.author.nickname,
        },
        isSaved: !!user.saved_posts.find(({ _id }) => post._id === _id),
        isUserPost: req.session.uid == post.author._id.toString(),
        cover: post.cover,
        link: `http://${process.env.HOSTNAME}/post/${post._id}`,
        id: post._id
    }))

    res.render(
        'pages/posts/index.hbs',
        {
            isSavedPostsPage: true,
            title: 'Сохраненные посты',
            pages,
            posts,
            active_page: page,
        },
    );
})

module.exports = router;
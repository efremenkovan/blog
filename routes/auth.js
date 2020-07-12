const { Router } = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const router = new Router();

router.get('/signup', (req, res, next) => {
	res.render('pages/register.hbs', {
		title: "Регистрация",
		isAuthPage: true,
		isRegister: true
	});
});

router.get('/signin', (req, res, next) => {
	res.render('pages/login.hbs', {
		title: "Вход",
		isAuthPage: true,
		isLogin: true
	});
});

router.post('/auth/signup', async (req, res, next) => {
	const user = await User.findOne({ nickname: req.body.nickname })
	if (user) {
		res.status(400).json({
			message: 'nickname|taken'
		});
	} else {
		try {
			bcrypt.hash(req.body.password, 10, async function (err, hash) {
				if (err) {
					console.error(err);
				}
				const { nickname, name, surname } = req.body;
				const user = new User({
					nickname,
					password: hash,
					name,
					surname,
					created_at: new Date().getTime(),
				})
				await user.save();
				req.session.isAuthenticated = true;
				req.session.uid = user._id;
				res.status(200).json({
					message: "OK",
				})
			});
		} catch (e) {
			console.error(e)
		}
	}
});

router.post('/auth/signin', async (req, res, next) => {
	const user = await User.findOne({ nickname: req.body.nickname })

	if (user) {
		bcrypt.compare(req.body.password, user.password, function (err, resust) {
			if (err) {
				console.error(err);
			}
			if (resust) {
				req.session.isAuthenticated = true;
				req.session.uid = user._id;

				res.json({
					message: "OK"
				});
				next();
			} else {
				res.json({
					message: "password|wrong",
				})
			}
			next();
		});
	} else {
		res.json({
			message: 'nickname|not_found'
		})
		next();
	}
});


router.get('/logout', async (req, res, next) => {
	req.session.destroy();
	res.redirect('/signin');
});

module.exports = router;

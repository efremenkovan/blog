const { Router } = require('express');

const router = new Router();

router.get('/auth', (req, res, next) => {
	res.render('pages/register.hbs', {
		title: "Авторизация",
		isAuthPage: true,
	});
});

router.post('/auth/signup', async (req, res, next) => {
	req.session.isAuthenticated = true;
	res.json({
		message: "OK",
	});
});

router.get('/logout', async (req, res, next) => {
	req.session.destroy();
	res.json('/auth/login');
});

module.exports = router;

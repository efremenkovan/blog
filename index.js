const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const session = require('express-session');
const volleyball = require('volleyball');
const MongoStore = require('connect-mongodb-session')(session)
const auth = require('./routes/auth');
const posts = require('./routes/posts');
const varMiddleware = require('./middleware/variables');

require('dotenv').config({
	path: path.join(__dirname, '../.env')
});

const store = new MongoStore({
	collection: 'sessions',
	databaseName: 'PracticeBlog',
	uri: process.env.MONGO_URI
})


// SETTINGS
const hbs = exphbs.create({
	defaultLayout: 'main',
	extname: 'hbs',
	helpers: {
		hasTag(tag, tags, options) {
			return tags.includes(tag);
		},
		ifEq(a, b, opts) {
			if (a == b) {
				return opts.fn(this);
			} else {
				return opts.inverse(this);
			}
		},
	},
});
app.use(volleyball);
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: false,
	})
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: 'SECRET PLACEHOLDER',
	resave: false,
	saveUninitialized: false,
	store
}));
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');
app.set('partials', path.join(__dirname, 'views/partials'));
app.use(helmet());
// END SETTINGS



// MIDDLEWARES
app.use(varMiddleware)
// END MIDDLEWARES



// ROUTES
app.use(auth);
app.use(posts);
app.get('/', function (req, res) {
	if (req.session.isAuthenticated) return res.redirect('/blog')
	res.render('pages/home.hbs');
});

app.get('/error', function (req, res) {
	let message;
	switch (req.query.status) {
		case '403':
			message = 'You don\'t have access to this page';
			break;
		case '404':
			message = 'Page not found';
			break;
		default:
			message = 'Something went wrong'
	}
	res.render('pages/error.hbs', {
		status: req.query.status,
		message
	});
});

// END ROUTES

mongoose.connect(
	process.env.MONGO_URI
	, {
	useNewUrlParser: true,
	useFindAndModify: true,
});

mongoose.connection.on('open', () => {
	console.log('connected to mogno');
	app.listen(process.env.PORT, () => {
		console.log('Listening on port! ', process.env.PORT);
	});
});

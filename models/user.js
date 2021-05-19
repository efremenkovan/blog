const { Schema, model } = require('mongoose');

const User = new Schema({
	name: {
		type: String,
		required: true,
	},
	surname: {
		type: String,
		required: true,
	},
	nickname: {
		type: String,
		required: true,
		unique: true
	},
	created_at: {
		type: Number,
		required: true,
	},
	posts_amount: {
		type: Number,
		default: 0,
	},
	posts: [
		{
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Post'
		},
	],
	saved_posts: [
		{
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Post',
		},
	],
	last_post: Number,
	password: {
		type: String,
		required: true,
	},
});

module.exports = model('User', User);

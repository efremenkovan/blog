const { Schema, model } = require('mognoose');

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
	},
	created_at: {
		type: Number,
		required: true,
	},
	posts_amount: {
		type: Number,
		default: 0,
		required: true,
	},
	posts: [
		{
			type: Schema.Types.ObjectId,
			required: true,
		},
	],
	saved_posts: [
		{
			type: Schema.Types.ObjectId,
			required: true,
		},
	],
	last_post: Number,
});

module.exports = model(User);

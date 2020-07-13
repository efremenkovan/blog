const { Schema, model } = require('mongoose');

const Post = new Schema({
	title: {
		type: String,
		required: true,
	},
	body: {
		type: String,
		required: true,
	},
	author: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	tags: [{
		label: String,
		value: String,
		color: String
	}],
	cover: {
		type: String,
		required: true,
	},
	rates: [
		{
			user: {
				type: Schema.Types.ObjectId,
				required: true,
				ref: 'User'
			},
			rate: {
				type: Number,
				required: true,
			},
		},
	],
});

module.exports = model('Post', Post);

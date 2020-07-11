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
	},
	rates: [
		{
			user: {
				type: Schema.Types.ObjectId,
				required: true,
			},
			rate: {
				type: Number,
				required: true,
			},
		},
	],
});

module.exports = model(Post);

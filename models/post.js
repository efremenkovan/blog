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
	tags: [String],
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

module.exports = model('Post',Post);

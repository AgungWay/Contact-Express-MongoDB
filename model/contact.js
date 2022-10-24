const mongoose = require('mongoose');
//Membuat Schema
const Contact = mongoose.model('contact', {
	nama: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	nomor: {
		type: String,
		required: true,
	},
});
module.exports = Contact;

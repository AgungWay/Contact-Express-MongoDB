const express = require('express');
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db.js');
const Contact = require('./model/contact.js');
const {body, validationResult, check} = require('express-validator');
const methodOverride = require('method-override');

const app = express();
const port = 3000;

//Set-Up method Override
app.use(methodOverride('_method'));
//Template Engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(expressLayout);

app.listen(port, () => {
	console.log(`Mongo ContactApp | Listening at http//localhost:${port}`);
});

//konfigurasi flash
app.use(cookieParser('secret'));
app.use(
	session({
		cookie: {maxAge: 6000},
		secret: 'secret',
		resave: true,
		saveUninitialized: true,
	})
);
app.use(flash());

//Halaman Home
app.get('/', (req, res) => {
	// res.sendFile('./index.html', {root: __dirname});
	const mahasiswa = [
		{
			nama: 'Agung',
			email: 'agung@gmail.com',
		},
		{
			nama: 'peter',
			email: 'peter@gmail.com',
		},
		{
			nama: 'deeez',
			email: 'deeez@gmail.com',
		},
	];
	res.render('index', {
		layout: 'layout/main-layout',
		title: 'ExpressJS',
		mahasiswa,
	});
});
//Halaman About
app.get('/about', (req, res) => {
	res.render('about', {
		layout: 'layout/main-layout',
		title: 'About',
	});
});
//Halaman Contact
app.get('/contact', async (req, res) => {
	const contacts = await Contact.find();
	res.render('contact', {
		layout: 'layout/main-layout',
		title: 'Contact',
		contacts,
		msg: req.flash('msg'),
	});
});

//Halaman tambah data kontak
app.get('/contact/add', (req, res) => {
	res.render('add-contact', {
		layout: 'layout/main-layout',
		title: 'Tambah Contact',
	});
});
//Proses tambah Data kontak
app.post(
	'/contact',
	[
		body('nama').custom(async val => {
			const duplikat = await Contact.findOne({nama: val});
			if (duplikat) {
				throw new Error('Nama Contact sudah ada !!');
			}
			return true;
		}),
		check('email', 'Email salah / Tidak Valid !!').isEmail(),
		check('nomor', 'Nomor HP tidak valid !!').isMobilePhone('id-ID'),
	],
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// return res.status(400).json({errors: errors.array()});
			res.render('add-contact', {
				title: 'Form tambah data contact',
				layout: 'layout/main-layout',
				errors: errors.array(),
			});
		} else {
			Contact.insertMany(req.body, (error, result) => {
				//kirimkan pesan flash
				req.flash('msg', 'Contact berhasil ditambahkan !!');
				res.redirect('/contact');
			});
		}
	}
);
//Proses Delete Kontak

// app.get('/contact/delete/:nama', async (req, res) => {
// 	const contact = await Contact.findOne({nama: req.params.nama});
// 	//jika kontak tidak ada
// 	if (!contact) {
// 		res.status(404);
// 		res.send('<h1>Kontak Tidak ada !');
// 	} else {
// 		Contact.deleteOne({_id: contact._id}).then(result => {
// 			req.flash('msg', 'Contact berhasil dihapus !!');
// 			res.redirect('/contact');
// 		});
// 	}
// });
app.delete('/contact', (req, res) => {
	Contact.deleteOne({nama: req.body.nama}).then(result => {
		req.flash('msg', 'Contact berhasil dihapus !!');
		res.redirect('/contact');
	});
});

//Form edit Kontak
app.get('/contact/edit/:nama', async (req, res) => {
	const contact = await Contact.findOne({nama: req.params.nama});
	res.render('edit-contact', {
		layout: 'layout/main-layout',
		title: 'Edit Contact',
		contact,
	});
});
//Proses Edit data kontak
app.put(
	'/contact',
	[
		body('nama').custom(async (val, {req}) => {
			const duplikat = await Contact.findOne({nama: val});
			if (val !== req.body.oldNama && duplikat) {
				throw new Error('Nama Contact sudah ada !!');
			}
			return true;
		}),
		check('email', 'Email salah / Tidak Valid !!').isEmail(),
		check('nomor', 'Nomor HP tidak valid !!').isMobilePhone('id-ID'),
	],
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('edit-contact', {
				title: 'Form edit data contact',
				layout: 'layout/main-layout',
				errors: errors.array(),
				contact: req.body,
			});
		} else {
			Contact.updateOne(
				{_id: req.body._id},
				{
					$set: {
						nama: req.body.nama,
						email: req.body.email,
						nomor: req.body.nomor,
					},
				}
			).then(result => {
				//kirimkan pesan flash
				req.flash('msg', 'Contact berhasil diedit !!');
				res.redirect('/contact');
			});
		}
	}
);
//Halaman detail kontak
app.get('/contact/:nama', async (req, res) => {
	// const contact = findContact(req.params.nama);
	const contact = await Contact.findOne({nama: req.params.nama});
	res.render('details', {
		layout: 'layout/main-layout',
		title: 'Detail Contact',
		contact,
	});
});

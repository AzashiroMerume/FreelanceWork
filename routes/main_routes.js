const {
	Router
} = require('express')
const https = require('https');
const UserModel = require('../models/users_model')
const PostModel = require('../models/posts_model')
const CommentModel = require('../models/comments_model')
const router = Router()
const Bcrypt = require("bcryptjs");
const {
	redirect
} = require('express/lib/response');
const mongoose = require('mongoose')


router.get('/', (req, res) => {

	if (req.session.isAuthorized) {
		return res.redirect('/main')
	}

	res.render('index', {
		title: 'FreelanceWork',
		isIndex: true,
	})
})

router.get('/main', async (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	let topFreelancers = await UserModel.find({
		userType: 'freelancer'
	}).lean().sort({
		points: -1
	}).limit(6)

	res.render('main', {
		title: 'FreelanceWork - find talents easily',
		isMain: true,
		topFreelancers: topFreelancers,
		layout: 'main',
	})
})

router.get('/jobs', async (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	const jobs = await PostModel.find().lean().sort({
		_id: -1
	})

	res.render('jobs', {
		title: 'FreelanceWork - all jobs',
		isJobs: true,
		jobs: jobs,
		layout: 'main'
	})
})

router.get('/jobs/:id', async (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	let id = req.params.id

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.redirect('/404')
	}

	let data = await PostModel.findOne({
		_id: id
	}).lean()

	let comments = await CommentModel.find({
		postID: id
	}).lean()

	let isMe
	if (data.userID == req.session.userID) {
		isMe = true
	} else {
		isMe = false
	}

	if (req.session.userType === 'freelancer') {
		res.render('job_inf', {
			title: 'FreelanceWork - job',
			isFreelancer: true,
			comments: comments,
			job: data,
			layout: 'main'
		})
	} else {
		res.render('job_inf', {
			title: 'FreelanceWork - job',
			job: data,
			isCustomer: true,
			isMe: isMe,
			comments: comments,
			layout: 'main'
		})
	}

})

router.post('/jobs/:id', async (req, res) => {
	if (req.body.comment) {
		await CommentModel.findByIdAndUpdate(req.body.comment, {
			authorComments: req.body.answer
		})
	} else {
		let message = req.body.message

		const comment = new CommentModel({
			postID: req.params.id,
			userID: req.session.userID,
			username: req.session.username,
			message: message
		})

		await comment.save()
	}
	res.redirect('/profile')
})

router.get('/jobs/category/:category', async (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	let category = req.params.category

	let categoryData = await PostModel.find({
		categories: {
			$all: [category]
		}
	}).lean()

	res.render('jobs', {
		title: 'FreelanceWork - categories',
		isCategory: true,
		category: category,
		jobs: categoryData,
		layout: 'main'
	})

})

router.get('/freelancers', async (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	let freelancers = await UserModel.find({
		userType: 'freelancer'
	}).lean().sort({
		points: -1
	}).limit(10)
	let username = freelancers.firstname + ' ' + freelancers.surname

	res.render('freelancers', {
		title: 'FreelanceWork - all freelancers',
		isFreelancers: true,
		freelancers: freelancers,
		layout: 'main'
	})
})

router.post('/freelancers', async (req, res) => {
	let searched = req.body.search

	let founded = await UserModel.find({
		$or: [{
			firstname: searched
		}, {
			surname: searched
		}]
	}).where('userType').equals('freelancer')

	res.render('freelancers', {
		title: 'FreelanceWork - all freelancers',
		isFreelancer: true,
		founded: founded,
		layout: 'main'
	})
})

router.get('/help', (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	res.render('help', {
		title: 'FreelanceWork - help',
		isHelp: true,
		layout: 'main'
	})
})

router.get('/post', (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	if (req.session.userType === 'freelancer') {
		return res.redirect('/jobs')
	}

	res.render('post', {
		title: 'FreelanceWork - post project',
		layout: 'main'
	})
})

router.post('/post', async (req, res) => {
	let userID = req.session.userID
	let title = req.body.title
	let shortDescription = req.body.shortDescription
	let categories = req.body.categories
	let description = req.body.description

	const post = new PostModel({
		userID: userID,
		username: req.session.username,
		title: title,
		shortDescription: shortDescription,
		categories: categories,
		description: description,
	})

	await post.save()
	res.redirect('/jobs')
})

router.get('/updatepost/:id', async (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	let postID = req.params.id

	if (!mongoose.Types.ObjectId.isValid(postID)) {
		return res.redirect('/404')
	}

	let post = await PostModel.findById(postID)

	if (post) {
		res.render('updatePost', {
			title: 'FreelanceWork - update post',
			layout: 'main'
		})
	} else {
		return res.redirect('/404')
	}

})

router.post('/updatepost/:id', async (req, res) => {
	let userID = req.session.userID
	let title = req.body.title
	let shortDescription = req.body.shortDescription
	let categories = req.body.categories
	let description = req.body.description

	await PostModel.findByIdAndUpdate(req.params.id, {
		userID: userID,
		username: req.session.username,
		title: title,
		shortDescription: shortDescription,
		categories: categories,
		description: description,
	})

	res.redirect('/profile')
})

router.post('/deletepost/:id', async (req, res) => {
	let postID = req.params.id

	if (!mongoose.Types.ObjectId.isValid(postID)) {
		console.log('mistake')
		return res.redirect('/404')
	}

	let post = await PostModel.findByIdAndDelete(postID)

	if (post) {
		return res.redirect('/profile')
	} else {
		console.log('mistake')
		return res.redirect('/404')
	}
})

router.get('/profile', async (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	// let userIP = req.socket.remoteAddress
	// let urlToApi = `http://api.weatherapi.com/v1/current.json?key=cfa1e38193dc4a14aa5114538221904&q=${userIP}`

	// https.get(urlToApi, function (response) {
	// 	let data = [];
	// 	response.on("data", (chunck) => {
	// 		data.push(chunck);
	// 	});
	// 	response.on("end", () => {
	// 		let weather = JSON.parse(Buffer.concat(data).toString());
	// 		console.log(weather)
	// 	});
	// });

	let userID = req.session.userID

	let data = await UserModel.findById(userID).lean()

	if (req.session.userType === 'freelancer') {
		res.render('profile', {
			title: 'FreelanceWork - my profile',
			isMe: true,
			isFreelancer: true,
			user: data,
			username: req.session.username,
			layout: 'main'
		})
	} else {
		let customerRequests = await PostModel.find({
			userID: req.session.userID
		}).lean().sort({
			_id: -1
		})
		res.render('profile', {
			title: 'FreelanceWork - my profile',
			isMe: true,
			isCustomer: true,
			user: data,
			username: req.session.username,
			requests: customerRequests,
			layout: 'main'
		})
	}
})

router.get('/profile/:id', async (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	let userID = req.params.id

	if (!mongoose.Types.ObjectId.isValid(userID)) {
		return res.redirect('/404')
	}

	if (userID === req.session.userID) {
		return res.redirect('/profile')
	}

	let data = await UserModel.findById(userID).lean()
	let username = data.firstname + ' ' + data.surname


	if (data.userType === 'freelancer') {
		res.render('profile', {
			title: 'FreelanceWork - ' + username,
			isMe: false,
			isFreelancer: true,
			username: username,
			user: data,
			layout: 'main'
		})
	} else {
		let customerRequests = await PostModel.find({
			userID: userID
		}).sort({
			_id: -1
		})
		res.render('profile', {
			title: 'FreelanceWork - ' + username,
			isMe: false,
			isCustomer: true,
			username: username,
			user: data,
			requests: customerRequests,
			layout: 'main'
		})
	}

})

router.get('/myprojects', async (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	let projects = await PostModel.find({
		userID: req.session.userID
	}).lean().sort({
		_id: -1
	})

	if (req.session.userType === 'freelancer') {
		res.render('projects', {
			title: 'FreelanceWork - my projects',
			isCustomer: false,
			layout: 'main'
		})
	} else {
		res.render('projects', {
			title: 'FreelanceWork - my projects',
			projects: projects,
			isCustomer: true,
			layout: 'main'
		})
	}
})

router.get('/updateprofile', (req, res) => {

	if (!req.session.isAuthorized) {
		return res.redirect('/login')
	}

	let isFreelancer

	if (req.session.userType === 'freelancer') {
		isFreelancer = true
	} else {
		isFreelancer = false
	}
	res.render('updateProfile', {
		title: 'FreelanceWork - update profile',
		isFreelancer: isFreelancer,
		layout: 'main'
	})
})

router.post('/updateprofile', async (req, res) => {
	let firstname = req.body.firstname
	let surname = req.body.surname
	let bio = req.body.bio
	let portfolio = req.body.portfolio
	let linkedin = req.body.linkedin

	await UserModel.findByIdAndUpdate(req.session.userID, {
		firstname: firstname,
		surname: surname,
		bio: bio,
		portfolio: portfolio,
		linkLinkedin: linkedin
	})

	req.session.username = firstname + ' ' + surname
	res.redirect('/profile')
})

router.get('/login', (req, res) => {

	if (req.session.isAuthorized) {
		return res.redirect('/main')
	}

	res.render('login', {
		title: 'FreelanceWork - Login'
	})
})

router.post('/login', async (req, res) => {
	let email = req.body.email
	let password = req.body.password

	let login = await UserModel.findOne({
		email: email
	});

	if(login !== null && Bcrypt.compareSync(password, login.password) && login.isAdmin === true) {
		req.session.isAdmin = true
		res.redirect('/admin')
	} else if (login !== null && Bcrypt.compareSync(password, login.password)) {
		req.session.isAuthorized = true
		req.session.username = login.firstname + ' ' + login.surname
		req.session.userType = login.userType
		req.session.userID = login._id
		res.redirect('/main')
	} else {
		res.render('login', {
			title: 'FreelanceWork - Login',
			error: true,
		})
	}
})

router.get('/register', (req, res) => {

	if (req.session.isAuthorized) {
		return res.redirect('/main')
	}

	res.render('register', {
		title: 'FreelanceWork - Sign up',
		passwordError: false,
	})
})

router.post('/register', async (req, res) => {
	let errorEmail = false;
	let errorPassword = false;
	let firstname = req.body.firstname
	let surname = req.body.surname
	let email = req.body.email
	let password = req.body.password
	let userType = req.body.userType

	if (password.length > 31 || password.length < 6) {
		errorPassword = true;
	}

	let checkError = await UserModel.findOne({
		email: email
	});

	if (checkError !== null) {
		errorEmail = true;
	}

	if (errorPassword) {
		res.render('register', {
			title: 'FreelanceWork - Sign up',
			passwordError: true,
		})
	} else if (errorEmail) {
		res.render('register', {
			title: 'FreelanceWork - Sign up',
			emailError: true,
		})
	} else {
		const user = new UserModel({
			firstname: firstname,
			surname: surname,
			email: email,
			password: Bcrypt.hashSync(password, 10),
			userType: userType
		})

		await user.save()

		let userInf = await UserModel.findOne({
			email: email
		})
		req.session.userID = userInf._id
		req.session.userType = userType
		req.session.username = firstname + ' ' + surname
		req.session.isAuthorized = true
		res.redirect('/main')
	}
})

router.get('/logout', (req, res) => {
	req.session.destroy((error) => {
		console.log("Session Destroyed")
	})

	res.redirect('/')
})

router.get('/404', (req, res) => {
	res.status(404)
	res.render('spec/404', {
		title: 'FreelanceWork - 404'
	})
})

module.exports = router
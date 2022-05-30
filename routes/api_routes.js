const {
    Router
} = require('express')
const UserModel = require('../models/users_model')
const PostModel = require('../models/posts_model')
const router = Router()

router.get('/freelancers/top', async (req, res) => {
    let topFreelancers = await UserModel.find({
		userType: 'freelancer'
	}).lean().sort({
		points: -1
	}).limit(10)

    console.log(topFreelancers)

    res.status(201).json(topFreelancers.firstname);
})


module.exports = router
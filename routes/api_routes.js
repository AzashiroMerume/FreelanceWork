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

    let response = []

    topFreelancers.forEach((freelancer) => {
        response.push(freelancer.firstname, freelancer.surname, freelancer.email, freelancer.points)
    })

    res.json(response);
})


module.exports = router
const {
    Router
} = require('express')
const UserModel = require('../models/users_model')
const PostModel = require('../models/posts_model')
const CommentModel = require('../models/comments_model');
const mongoose = require('mongoose')
const router = Router()

router.get('/admin', (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/404')
    }

    res.render('spec/admin', {
        layout: 'admin'
    })
})

router.get('/allusers', (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/404')
    }

    res.render('spec/allusers', {
        layout: 'admin'
    })
})

router.post('/allusers', async (req, res) => {
    if (req.body.user) {
        await UserModel.findByIdAndDelete(req.body.user)
        return res.redirect('/allusers')
    }

    let searched = req.body.search
    let founded = false

    if (mongoose.Types.ObjectId.isValid(searched)) {
        founded = await UserModel.findById(searched).lean()
    } else {
        founded = await UserModel.find({
            $or: [{
                firstname: searched
            }, {
                surname: searched
            }]
        }).lean()
    }

    res.render('spec/allusers', {
        title: 'FreelanceWork - admin',
        founded: founded,
        layout: 'admin'
    })
})

router.get('/alljobs', (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/404')
    }

    res.render('spec/alljobs', {
        title: 'FreelanceWork - admin',
        layout: 'admin'
    })
})

router.post('/alljobs', async (req, res) => {
    if (req.body.post) {
        await PostModel.findByIdAndDelete(req.body.post)
        await CommentModel.findOneAndDelete({
            postID: req.body.post
        })
        return res.redirect('/alljobs')
    }

    let searched = req.body.search
    let founded = false

    if (mongoose.Types.ObjectId.isValid(searched)) {
        founded = await PostModel.findById(searched).lean()
    }

    res.render('spec/alljobs', {
        title: 'FreelanceWork - admin',
        founded: founded,
        layout: 'admin'
    })
})

module.exports = router
const {Schema, model} = require('mongoose')


const schema = new Schema({
    firstname: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: '',
    },
    portfolio: {
        type: String,
        default: '',
    },
    linkLinkedin: {
        type: String,
        default: '',
    },
    points: {
        type: Number,
        default: 0,
    }
})

module.exports = model('Users', schema)
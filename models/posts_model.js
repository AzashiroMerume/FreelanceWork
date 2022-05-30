const {Schema, model} = require('mongoose')


const schema = new Schema({
    userID: {
        type: Schema.ObjectId,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
        required: true,
    },
    categories: [{
        type: String,
    }],
    description: {
        type: String,
        required: true,
    },
})

module.exports = model('Posts', schema)
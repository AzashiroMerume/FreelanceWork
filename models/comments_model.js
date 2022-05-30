const {Schema, model} = require('mongoose')


const schema = new Schema({
    postID: {
        type: Schema.ObjectId,
        required: true,
    },
    userID: {
        type: Schema.ObjectId,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
})

module.exports = model('Coments', schema)
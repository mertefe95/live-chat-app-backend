const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now()
    },
    activationKey: {
        type: String,
        default: uuidv4
    },
    activatedDateTime: {
        type: Date,
        default: null
    },
    lastUpdated: {
        type: Date,
        default: null
    },
    forgotToken: {
        type: String,
        default: null
    }
},
{
    timestamps: true
})


const User = mongoose.model('User', userSchema);


module.exports = User;
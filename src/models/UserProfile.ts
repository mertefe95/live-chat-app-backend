import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userProfileSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    favoriteFood: {
        type: String,
        required: true
    },
    favoriteChatRoom: {
        type: String,
        required: true
    }

}, {
    timestamps: true
})

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

export { UserProfile };
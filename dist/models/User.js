"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
const userSchema = new mongoose_2.Schema({
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
        default: uuid_1.v4
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
}, {
    timestamps: true
});
const User = mongoose_1.default.model('User', userSchema);
exports.User = User;
//# sourceMappingURL=User.js.map
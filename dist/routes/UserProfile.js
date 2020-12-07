"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const UserProfile_1 = __importDefault(require("../models/UserProfile"));
router.get('/userprofile', (req, res) => {
    const userProfile = UserProfile_1.default.find({});
    if (!userProfile) {
        return res
            .status(400)
            .send();
    }
    return res
        .status(200)
        .send(userProfile);
});
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const User = require('../models/User');
const router = express.Router();
router.get('/', (req, res) => {
    const users = User.find({});
    if (!users) {
        return res
            .status(400)
            .send();
    }
    return res
        .status(200)
        .send();
});
exports.default = router;

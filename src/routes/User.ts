const express = require('express');
const User = require('../models/User');
const router = express.Router();
import { Request, Response } from "express";

router.get('/', (req: Request, res: Response ) => {
    const users = User.find({})

    if (!users) {
        return res
            .status(400)
            .send()
    }
    return res
        .status(200)
        .send()

})




export default router;
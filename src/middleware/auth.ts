const jwt = require('jsonwebtoken');
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'../../.env' });

import { Request, Response, NextFunction} from "express";

const SECRET_TOKEN: string = (process.env.SECRET_TOKEN as string);

const auth = (req: any, res: Response, next: NextFunction) => {
    try {
    const token: any = req.header("x-auth-token")
    
    if(!token) {
        return res
            .status(401)
            .json({ msg: "Token not found. Authorization has been denied."})
    }

    const isVerified = jwt.verify(token, SECRET_TOKEN)
    if(!isVerified) {
        return res
            .status(400)
            .json({ msg: "Unsuccesful token verification. Authentication denied. "})
    }

    req.user = isVerified.id;
    next();
    
    } catch (err) {
        return res
            .status(500)
            .send(err)  
}}

export {auth}
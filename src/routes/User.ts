const express = require('express');
import { User } from '../models/User';
const router = express.Router();
import { Request, Response } from "express";
import { sendConfirmationEmail, sendActivatedEmail, sendForgotPassword } from "../utils/account";
import  bcrypt   from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import uuid from "uuid";
import path from "path";
import { auth } from "../middleware/auth";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";


import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'../../.env' });

const SECRET_TOKEN: string = (process.env.SECRET_TOKEN as string);
const client = new OAuth2Client("310321453603-jj2qtlkeer5o2u30tdnf216knss728ia.apps.googleusercontent.com")


router.get('/users', async (req: Request, res: Response) => {
    const users = await User.find({})

    if (!users) {
        return res
            .status(400)
            .send({msg: "No user has been found."})
}

    return res
        .status(200)
        .send(users)
})

router.get('/users/:id', async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return res
            .status(400)
            .send({ msg: "User not found."})
}

    return res
        .status(200)
        .send(user)
})


router.get('/', auth, async (req: any, res: Response) => {
    const user: any = await User.findById(req.user);
    res.json({
        username: user.username,
        id: user._id
    });
});


router.get('/activation/:activationKey', async (req: Request, res: Response) => {
    const { activationKey }  = req.params

    if(!activationKey) {
        return res
            .status(400)
            .send()
}

    const user: any = await User.findOne({ activationKey })

    if(!user) {
        return res
            .status(404)
            .send()
}

    const { activatedDateTime } = user

    if (activatedDateTime) {
        return res
            .status(404)
            .send({ msg: "This user has been activated before." })
}

    const dateNow = Date.now().toString()

    await User.updateOne(
        { activationKey },
        { activatedDateTime: dateNow, lastUpdated: dateNow }
    )

    sendActivatedEmail(user)
    return res
        .status(200)
        .send(({ msg: "Account has been activated."}))
})


router.get('/forgot-password/:forgotToken', async (req: Request, res: Response) => {
const {forgotToken} = req.params

const userK = await User.findOne({ forgotToken })

if (!forgotToken) {
    return res
        .status(400)
        .send({ msg: "Forgot token not found in the URL. Please enter your Forgot Token. "})
} else if (!userK) {
    return res
        .status(400)
        .send({ msg: "No user found with the related forgot token. Empty or wrong token. "})
}

return res
    .status(200)
    .send()

})


router.post('/register', async (req: Request, res: Response) => {
    const { username, email, password } = req.body
    const digit = /^(?=.*\d)/
    const upperLetter = /^(?=.*[A-Z])/

    if (!username || !email || !password) {
        return res
            .status(400)
            .send({ msg: "Please fill all the credentials. "})
}

if (!validator.isEmail(email) || !email) {
        return res.status(400).send({ msg: 'Please enter a valid email. ' })
}

if (!digit.test(password) || !upperLetter.test(password)) {
    return res
        .status(400)
        .send({ msg: "Please enter a password with at least a number and an uppercase letter."})
} else if (password.length < 8) {
        return res
            .status(400)
            .send({ msg: "Please enter a password that is at least 8 characters or more."})
    }

    try {
        let userExistsByEmail = await User.findOne({ email: email })
        let userExistsByUserName = await User.findOne({ username: username })

        if (userExistsByEmail) {
            return res
                .status(400)
                .send({ msg: "The email is already used."})
            } else if (userExistsByUserName) {
            return res
                .status(400)
                .send({ msg: "Username already being used. Please enter a different username. "})
        }

        let encPassword = ''
        let theSalt = await bcrypt.genSalt(10)
        encPassword = await bcrypt.hash(password, theSalt)

        let registrationRequest = {
            username,
            email,
            password: encPassword
        }

        const user = new User(registrationRequest)
        await user.save()


        sendConfirmationEmail(user)

        res.status(200).send('Successful registration. Please verify your email. ')
} catch (e) {
        res.status(400).send(e)
    }
})

router.post('/login', async (req: Request, res: Response) => {
try {
    const { email, password } = req.body 

        if (!email || !password) {
            return res
                .status(400)
                .send({ msg: "Please fill the missing fields. "})
        }

        const user: any = await User.findOne({ email  })
        if (!user) {
            return res
                .status(400)
                .send({ msg: "An account with this email or username does not exists."})
        } else if (user && !user.activatedDateTime) {
            return res
                .status(400)
                .send({ msg: "Please activate your account from the link we've sent to your email. "})
        } else if (user && user.activatedDateTime) {
            const passwordCompare = await bcrypt.compare(password, user.password)
            if (!passwordCompare) {
                return res
                    .status(400)
                    .send({ msg: "Wrong or empty password." })
            } else if (passwordCompare) {
                const token = jwt.sign(
                    {  id: user.id },
                    SECRET_TOKEN
                );
            
                return res
                    .status(200)
                    .json({ token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    }})
            }
        }
} catch (e) {
    res.status(500).send(e)
}
})

router.post("/tokenIsValid", async (req: Request, res: Response) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.json(false);

        const verified: any = jwt.verify(token, SECRET_TOKEN);
        if (!verified) return res.json(false);


        const user = await User.find(verified.id);
        if (!user) return res.json(false);

        return res.json(true);
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }})


router.post("/forgot-password/", async (req: Request, res: Response) => {
    const { email } = req.body

    const user: any = await User.findOne({ email })

    try {
        if (!validator.isEmail(email) || !email) {
            return res
                .status(400)
                .send({ msg: "Please enter a valid email. "})
        } else if (!user) {
            return res
                .status(404)
                .send({ msg: 'No account has been found related to that email. '})
        } else if (user.forgotToken) {
            return res
                .status(400)
                .send({ msg: "Password change mail is already been sent. Please check your email."})
        } else if (user) {
            
    
            await user.updateOne({ forgotToken: uuid })

            await sendForgotPassword(user)
        
        return res
            .status(200)
            .send("Password change mail has been sent.")
        }} catch (e) {
        return res
            .status(500)
            .send()
        }
})


router.post('/change-password', async (req: Request, res: Response) => {

    try {
        const { newPassword, forgotToken } = req.body
        const digit = /^(?=.*\d)/
        const upperLetter = /^(?=.*[A-Z])/

        if (!newPassword || !forgotToken) {
        return res
            .status(400)
            .send({ msg: "Please enter your new password and your forgot password key token."})
        } 
    
        const userK = await User.findOne({ forgotToken })

        if (!userK) {
        return res.status(400).send({
            msg: 'Token does not match. Enter the valid token.'
        })}

        if (newPassword && userK){
        if (!digit.test(newPassword) || !upperLetter.test(newPassword)) {
        return res.status(400).send({
            msg:
            'Please enter at least a number and an uppercase letter with your password.',
        })} else if (newPassword.length < 8) {
        return res.status(400).send({
            msg: 'Please enter a password that is at least 8 or more characters.',
        })} else if (digit.test(newPassword) && upperLetter.test(newPassword) && !(newPassword.length < 8) ) {


        let encNewPassword = ''
        let theNewSalt = await bcrypt.genSalt(10)
        encNewPassword = await bcrypt.hash(newPassword, theNewSalt)

        await userK.updateOne({ password: encNewPassword, forgotToken: null, activatedDateTime: null })

        return res.status(200).send("Password has been successfully changed.")
        }
        }} catch (e) {
        return res.status(500).send(e)
        }
})






export { router as userRouter };
const express = require('express');
const User = require('../models/User');
const router = express.Router();
import { Request, Response } from "express";




router.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
})



router.get('/users/:id', (req: Request, res: Response) => {
    const _id = req.params.id

    User.findById(_id)
        .then((user: object) => {
        if (!user) {
            return res.status(400).send()
        }

        res.send(user)
        })
    .catch((e: any) => {
        res.status(500).send()
        })
})


router.get('/activation/:activationKey', async (req: Request, res: Response) => {
    const { activationKey } = req.params

    if (!activationKey) {
        return res.status(400).send()
    }

    const user = await User.findOne({ activationKey })
    console.log(user)

    if (!user) {
        return res.status(404).send()
    }
    
    const { activatedDateTime, email } = user

    if (activatedDateTime) {
        return res.status(404).send()
    }

    const dateNow = Date.now().toString()

    await User.updateOne(
      { activationKey },
      { activatedDateTime: dateNow, lastUpdated: dateNow }
    )
  
    return res.status(200).send()
  })
  
  router.get('/forgot-password/:forgotToken', async (req, res) => {
    const { forgotToken } = req.params
    const userK = await UserKey.findOne({ key: forgotToken })
  
    if (!forgotToken) {
      return res
        .status(400)
        .send({ error: "Forgot token not found in the URL. Please enter your Forget Token." })
    } else if (!userK) {
      return res
        .status(404)
        .send({ error: "Empty or wrong key" })
    }
  
    try {
      if (!userK.key === forgotToken || !userK.keyType === 'forgot-password') {
        return res
        .status(400)
        .send({ error: "Please first apply to forgot-password section."})
      } else if (userK.key === forgotToken && userK.keyType === "forgot-password") {
            return res
            .status(200)
            .send("You may change your password.")
      }} catch (e) {
    return res
      .status(500)
      .send()
  
  }
  })
  
  router.post('/users', async (req, res) => {
    const { email, password } = req.body
    const digit = /^(?=.*\d)/
    const upperLetter = /^(?=.*[A-Z])/
    const dateNow = Date.now().toString()
  
    if (!email || !password) {
      return res
        .status(400)
        .send({ error: 'Please fill the required missing fields.' })
    } else if (!digit.test(password) || !upperLetter.test(password)) {
      return res.status(400).send({
        error:
          'Please enter at least a number and an uppercase letter with your password.',
      })
    } else if (password.length < 8) {
      return res.status(400).send({
        error: 'Please enter a password that is at least 8 or more characters.',
      })
    }
  
    try {
      let userExists = await User.find({ email })
  
      if (userExists.length > 0) {
        return res.status(400).send({ error: 'User already exists' })
      }
  
      let encPassword = ''
      let theSalt = await bcrypt.genSalt(10)
      encPassword = await bcrypt.hash(password, theSalt)
  
      let registrationRequest = {
        email,
        password: encPassword,
        lastUpdated: dateNow,
      }
      const user = new User(registrationRequest)
      await user.save()
  
      let upRequest = {
        userId: user._id,
      }
      const userProfile = new UserProfile(upRequest)
      await userProfile.save()
      //sendConfirmationEmail(user)
      res.status(200).send('Successful registration')
    } catch (e) {
      res.status(400).send(e)
    }
  })
  
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body
      if (!email && !password) {
        return res
          .status(400)
          .send({ error: 'Please enter both your email and password.' })
      }
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).send({ error: 'Email does not exists. ' })
      } else if (user.email === email) {
        passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
          return res.status(400).send({ error: 'Wrong or empty password. ' })
        } else if (passwordCompare) {
          const dateNow = Date.now().toString()
          // await user.updateOne({ lastUpdated: dateNow })
          const userProfile = await UserProfile.findOne({ userId: user._id })
          await userProfile.updateOne({
            lastActivity: dateNow,
            userStatus: 'online',
          })
  
          const token = await jwt.sign(
            { email: user.email, id: user.id },
            process.env.ACCESS_TOKEN_SECRET
          )
  
          return res.status(200).json({ token: token })
        }
      }
    } catch (e) {
      res.status(400).send(e)
    }
  })
  
  router.post('/forgot-password', async (req, res) => {
    const { email } = req.body
  
    const user = await User.findOne({ email })
  
    try {
      if (!validator.isEmail(email) || !email) {
        return res.status(400).send({ error: 'Please enter a valid email. ' })
      } else if (!user) {
        return res
        .status(404)
        .send({ error: 'No account found with that e-mail. ' })
      } else if (user) {
        const userK = new UserKey
        await userK.save()
  
        await userK.updateOne({ userId: user.id, keyType: 'forgot-password' })
  
        sendForgotPassword(user)
  
        return res.status(200).send("Mail related to password renewal has been sent.")
      }
    } catch (e) {
      res.status(500).send()
    }
  })
  
  
  router.post('/change-password', async (req, res) => {
    
      try {
        const { newPassword, forgotToken } = req.body
        const digit = /^(?=.*\d)/
        const upperLetter = /^(?=.*[A-Z])/
  
        if (!newPassword || !forgotToken) {
          return res
            .status(400)
            .send({ error: "Please enter your new password and your forgot password key token."})
        } 
        
        const userK = await UserKey.findOne({ key: forgotToken })
  
        if (!userK) {
          return res.status(400).send({
            error: 'Token does not match. Enter the valid token.'
        })}
      
        const userMain = await User.findOne({ _id: userK.userId })
  
        if (newPassword && userK){
          if (!digit.test(newPassword) || !upperLetter.test(newPassword)) {
          return res.status(400).send({
            error:
              'Please enter at least a number and an uppercase letter with your password.',
          })} else if (newPassword.length < 8) {
          return res.status(400).send({
            error: 'Please enter a password that is at least 8 or more characters.',
          })} else if (digit.test(newPassword) && upperLetter.test(newPassword) && !newPassword.length < 8 ) {
      
  
            let encNewPassword = ''
            let theNewSalt = await bcrypt.genSalt(10)
            encNewPassword = await bcrypt.hash(newPassword, theNewSalt)
  
            await userMain.updateOne({ password: encNewPassword })
            await userK.deleteOne({})
  
            return res.status(200).send("Password has been successfully changed.")
          }
        }} catch (e) {
          return res.status(500).send(e)
        }
    
  })
  /*
  router.patch('/users/:id', async (req, res) => {
      try {
          const user = await User.
      }
      catch (e) {
  
      }
  });
  */
  
  router.delete('/users/:id', async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id)
  
      if (!user) {
        return res.status(404).send()
      }
  
      res.send(user)
    } catch (e) {
      res.status(500).send()
    }
  })

router.post('/')




export default router;
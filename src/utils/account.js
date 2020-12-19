
const nodemailer =  require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config( { path: path.resolve(__dirname, '../../.env') });

const transport = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
    })
)

const sendForgotPassword = (user, forgotT) => {
    const url = `http://localhost:3000/forgot-password/${forgotT}`

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}`,
        subject: "Forgot password mail",
        html: `Forgot Password Mail Test <a href=${url}> ${url} </a>`
    })
}

const sendActivatedEmail = (user) => {

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}`,
        subject: "Your Email has been Activated",
        html: `Your Email has been activated. Please visit our homepage.`
    })
}

const sendVerificationEmail = (user) => {
    const url = `http://localhost:3000/user-activated/${user.activationKey}`

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}>`,
        subject: "Confirmation Email",
        html: `Confirmation Email testing :) <a href=${url}> ${url}</a>`
    })
}

module.exports = {
    sendVerificationEmail,
    sendActivatedEmail,
    sendForgotPassword
}
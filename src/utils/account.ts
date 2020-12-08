import nodemailer from 'nodemailer';
import nodemailerSendgrid from 'nodemailer-sendgrid';
import path from 'path';
require('dotenv').config( { path: path.resolve(__dirname, '../../.env') } );
import { v4: uuidv4 } from 'uuid';


const transport = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
    })
)

const sendForgotPassword = (user: object) => {
    const url = `http://localhost:8080/api/forgot-password/${user.forgotToken}`

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}`,
        subject: "Forgot password mail",
        html: `Forgot Password Mail Test <a href=${url}> ${url} </a>`
    })
}

const sendActivatedEmail = (user: object) => {

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}`,
        subject: "Your Email has been Activated",
        html: `Your Email has been activated. Please visit our homepage.`
    })
}

const sendConfirmationEmail = (user: object) => {
    const url = `http://localhost:8080/api/activation/${user.activationKey}`

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}>`,
        subject: "Confirmation Email",
        html: `Confirmation Email testing :) <a href=${url}> ${url}</a>`
    })
}

module.exports = {
    sendConfirmationEmail,
    sendActivatedEmail,
    sendForgotPassword
}
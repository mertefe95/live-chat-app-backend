
import nodemailer from 'nodemailer';
import nodemailerSendgrid  from 'nodemailer-sendgrid';
import path from 'path';
import  uuidv4  from 'uuid';


import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'../../.env' });

const SENDGRID_API_KEY: string = (process.env.SENDGRID_API_KEY as string);
const ADMIN_EMAIL: string = (process.env.ADMIN_EMAIL as string);



const transport = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: SENDGRID_API_KEY
    })
)


const sendForgotPassword = (user: any) => {
    const url = `http://localhost:8080/api/forgot-password/${user.forgotToken}`

    transport.sendMail({
        from: ADMIN_EMAIL,
        to: `<${user.email}`,
        subject: "Forgot password mail",
        html: `Forgot Password Mail Test <a href=${url}> ${url} </a>`
    })
}

const sendActivatedEmail = (user: any) => {

    transport.sendMail({
        from: ADMIN_EMAIL,
        to: `<${user.email}`,
        subject: "Your Email has been Activated",
        html: `Your Email has been activated. Please visit our homepage.`
    })
}

const sendConfirmationEmail = (user: any) => {
    const url = `http://localhost:8080/api/activation/${user.activationKey}`

    transport.sendMail({
        from: ADMIN_EMAIL,
        to: `<${user.email}>`,
        subject: "Confirmation Email",
        html: `Confirmation Email testing :) <a href=${url}> ${url}</a>`
    })
}

export {
    sendConfirmationEmail,
    sendActivatedEmail,
    sendForgotPassword
}
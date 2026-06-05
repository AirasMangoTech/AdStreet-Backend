const nodemailer = require("nodemailer");
require('dotenv').config()

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const transporterOTP = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    // user: process.env.SMTP_USER_OTP,
    // pass: process.env.SMTP_PASS_OTP,
    user: 'info@adstreet.com.pk',
    pass: 'Largestmarketplace2023',
  },
});
  
  module.exports = {
    transporter,
    transporterOTP,
  };
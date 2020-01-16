const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
require('dotenv').config();

module.exports = {
    otpMailer: async (email)=> {   
        const otp = await otpGenerator.generate(6, {alphabets: false ,upperCase: false, specialChars: false});

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.senderEmail,
            pass: process.env.emailPassword
          }
        });

        const mailOptions = {
          from: process.env.senderEmail,
          to: email,
          subject: 'Sending Email using Node.js',
          text: `your OTP is ${otp}`  
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
                });
        return otp;
    },
    checkToken: async (req, res, next) => {
        let token = await req.get("authorization");
        if (token) {
          // Remove Bearer from string
          token = await token.slice(7);
          jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
              return res.status(403).json({
                success: 0,
                message: "Invalid Token..."
              });
            } else {
              req.decoded = decoded;
              next();
            }
          });
        } else {
            return res.status(401).json({
              success: 0,
              message: "Access Denied! Unauthorized User"
            });
        }
      }
}
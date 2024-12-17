const { transporter, transporterOTP } = require("../config/email")

const sendEventEmailWithCC = async (toEmail ,subject, body) => {
    try {
        
        const info = await transporter.sendMail({
            from: `"ADSTREET" <events@adstreet.com.pk>`,
            to: toEmail,
            cc: 'sshashmi@adstreet.com.pk', 
            //cc: 'sajid.mangotech@gmail.com',
            subject: subject,
            text: subject,
            html: body,
          });
          return info;
    } catch (error) {
        console.log(error)
       return error;  
    }
}

const sendOTPEmail = async (toEmail ,subject, body) => {
    try {
        
        const info = await transporterOTP.sendMail({
            from: `"ADSTREET" <info@adstreet.com.pk>`,
            to: toEmail, 
            subject: subject,
            text: subject,
            html: body,
          });
          return info;
    } catch (error) {
        console.log(error)
       return error;  
    }
}

module.exports = {
    sendEventEmailWithCC,
    sendOTPEmail,
}
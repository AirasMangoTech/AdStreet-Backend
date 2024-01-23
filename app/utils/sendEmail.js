const transporter=require("../config/email")

const sendEmail = async (toEmail ,subject, body) => {
    try {
        
        const info = await transporter.sendMail({
            from: `"CocoPrime" <no-reply@cocoprimecleaning.ae>`,
            to: toEmail,
            subject: subject,
            text: subject,
            html: body,
          });
          console.log(info)
          return await info;
    } catch (error) {
        console.log(error)
       return error;  
    }
    
}

module.exports = {sendEmail}
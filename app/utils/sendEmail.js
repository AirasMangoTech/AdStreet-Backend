const transporter=require("../config/email")

const sendEmail = async (toEmail ,subject, body) => {
    try {
        
        const info = await transporter.sendMail({
            from: `"ADSTREET" <info@adstreet.com.pk>`,
            to: toEmail,
            //cc: 'sshashmi@adstreet.com.pk', 
            cc: 'sajid.mangotech@gmail.com',
            subject: subject,
            text: subject,
            html: body,
          });
          console.log(info)
          return info;
    } catch (error) {
        console.log(error)
       return error;  
    }
}

module.exports = {sendEmail}
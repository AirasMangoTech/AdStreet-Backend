const { transporter, transporterOTP } = require("../config/email");

const sendEventEmailWithCC = async (toEmail, subject, body) => {
  try {
    const info = await transporter.sendMail({
      from: `"ADSTREET" <connect@adstreet.com.pk>`,
      to: toEmail,
      cc: ["sshashmi@adstreet.com.pk", "hurmat@adstreet.com.pk"],
      subject: subject,
      text: subject,
      html: body,
    });
    return info;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const sendOTPEmail = async (toEmail, subject, body) => {
  try {
    const info = await transporterOTP.sendMail({
      from: `"ADSTREET" <no-reply@adstreet.pk>`,
      to: toEmail,
      subject: subject,
      text: subject,
      html: body,
    });
    return info;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  sendEventEmailWithCC,
  sendOTPEmail,
};

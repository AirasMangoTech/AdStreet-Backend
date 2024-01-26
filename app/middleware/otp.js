const OTPCode = require("../models/otp");
//const SMS = require("../utils/sendSms");
const generator = require('generate-password');
const moment = require('moment')


const GenerateOTP = (length) => {
  let OTP = generator.generate({
    length: length,
    numbers: true,
    lowercase: false,
    uppercase: false,
  });

  return OTP;
};


const verifyOTP = async (req, res, next) => {
  try {
    const device_id = req.headers.deviceid;
    const api_name = req.url; // or req.baseUrl + req.path to get the endpoint

    if (!device_id) {
      return res
        .status(400)
        .json({ message: "Device ID required." });
    }

    // Find the OTP for the device ID and API endpoint that hasn't expired or been verified
    const otp = await OTPCode.findOne({
      device_id: device_id,
      api_name: api_name,
      is_verified: false,
      expired_at: { $gte: new Date() },
    });

    if (!otp) {
      // If no valid OTP is found, generate and send a new one
      const newOtpCode = GenerateOTP(4);
      const newOtp = new OTPCode({
        device_id: device_id,
        code: newOtpCode,
        api_name: api_name,
        is_verified: false,
        expired_at: new Date(new Date().getTime() + 5 * 60000), 
      });
      await newOtp.save();
      console.log(newOtpCode);
      // Send the OTP to the user's phone
      //SMS.sendSMS(`Your OTP is: ${newOtpCode}`, phoneNumber);

      return res
        .status(200)
        .json({ message: "A new OTP has been sent to your phone." });
    }

    if (otp.code === req.body.code) {
      otp.is_verified = true;
      await otp.save();
      next(); // Proceed to next middleware
    } else {
      return res.status(401).json({ message: "Invalid OTP code." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "An error occurred while verifying OTP." });
  }
};

module.exports = {
  verifyOTP, GenerateOTP
};

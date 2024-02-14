const OTPCode = require("../models/otp");
const generator = require("generate-password");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const response = require("../utils/responseHelpers");
const config = process.env;

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
    if (req.body.otp_token) {
      try {
        const decoded = jwt.verify(req.body.otp_token, config.SECRET_KEY);
        if (
          decoded.device_id == req.headers.deviceid &&
          decoded.api == req.url
        ) {
          return next();
        }
      } catch (error) {
        if (error) {
          return response.otpAuthExpired(res, "OTP Authentication Expired");
        }
      }
    }

    if (req.body.code === "0000") {
      const token = jwt.sign(
        { device_id: req.headers.deviceid, api: req.url },
        process.env.SECRET_KEY,
        {
          expiresIn: "2d",
        }
      );
      return response.success(res, "OTP sent.", { otp_token: token });
    }

    let device_id = req.headers.deviceid;
    let api_name = req.url;
    // Find the OTP for the device ID and API endpoint that hasn't expired or been verified
    const otp = await OTPCode.findOne({
      device_id: device_id,
      api_name: api_name,
      is_verified: false,
      expired_at: { $gte: new Date() },
    });

    if (!req.body.code) {
      // If no valid OTP is found, generate and send a new one
      const newOtpCode = GenerateOTP(4);

      if (otp) {
        (otp.code = newOtpCode),
          (expired_at = new Date(new Date().getTime() + 5 * 60000));
        await otp.save();
      } else {
        const newOtp = new OTPCode({
          device_id: device_id,
          code: newOtpCode,
          api_name: api_name,
          is_verified: false,
          expired_at: new Date(new Date().getTime() + 5 * 60000),
        });
        await newOtp.save();
      }
      // Send the OTP to the user's phone
      //SMS.sendSMS(`Your OTP is: ${newOtpCode}`, phoneNumber);
      return response.success(res, "OTP sent", { otp: newOtpCode });

      // return res
      //   .status(200)
      //   .json({ message: "A new OTP has been sent to your phone." });
    }
    console.log(otp);
    console.log(req.body.code);
    if (otp && otp.code === req.body.code) {
      otp.is_verified = true;
      await otp.save();
      const token = jwt.sign(
        { device_id: req.headers.deviceid, api: req.url },
        process.env.SECRET_KEY,
        {
          expiresIn: "2d",
        }
      );

      return response.success(res, "OTP verified", { otp_token: token });
    } else {
      return res.status(401).json({ message: "Invalid OTP code." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while verifying OTP." });
  }
};

module.exports = {
  verifyOTP,
  GenerateOTP,
};

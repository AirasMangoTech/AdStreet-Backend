const OTPCode = require("../models/otp");
const verifyOTP = async (req, res, next) => {
  try {
    const { device_id, code } = req.body;

    if (!device_id || !code) {
      return res
        .status(400)
        .json({ message: "Device ID and OTP code are required." });
    }

    const otp = await OTPCode.findOne({ device_id: device_id });

    if (!otp || otp.is_verified) {
      return res
        .status(404)
        .json({ message: "OTP is invalid or already used." });
    }

    if (otp.code === code) {
      otp.is_verified = true;
      await otp.save();
      next();
    } else {
      return res.status(401).json({ message: "Invalid OTP code." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "An error occurred while verifying OTP." });
  }
};

function generateOTP() {
  // Generates a 4-digit random number
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
}

module.exports = generateOTP;

const otp = generateOTP();
console.log(otp); // Outputs a 4-digit OTP

module.exports = verifyOTP;

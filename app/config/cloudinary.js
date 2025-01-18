const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const { CLOUDINARY_SECRET_KEY, CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_SECRET_KEY,
});

module.exports = cloudinary;

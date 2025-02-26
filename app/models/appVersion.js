const mongoose = require("mongoose");

const versionSchema = mongoose.Schema({
  version: String,
  platform: String,
});

const AppVersion = mongoose.model("AppVersion", versionSchema);
module.exports = AppVersion;

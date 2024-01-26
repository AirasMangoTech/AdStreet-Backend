const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['Brand Company', 'Agency', 'Individual'], 
    required: true
  },
  roleId: {
    type: String,
    required: true,
    enum: ['role_1', 'role_2', 'role_3'], 
  }
});

const Role = mongoose.model("roles", roleSchema);
module.exports = Role;

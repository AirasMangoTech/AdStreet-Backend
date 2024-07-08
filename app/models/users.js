const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ROLE_IDS = require("../utils/utility");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  roles: {
    type: String,
    enum: [
      ROLE_IDS.BRAND_COMPANY,
      ROLE_IDS.AGENCY,
      ROLE_IDS.INDIVIDUAL,
      ROLE_IDS.ADMIN,
    ],
    required: true,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
  phone_Number: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  additional: {
    company_name: {
      type: String,
    },
    years_experience: {
      type: Number,
    },
    industry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Industry',
    },
    services: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    currentRole: {
      type: String,
    },
    area_expertise: {
      type: String,
    },
    s_link: {
      type: String,
    },
    w_link: {
      type: String,
    },
    p_link: {
      type: String,
    },
    facebook:{
      type: String,
    },
    twitter :{
      type: String,
    },
    linkedin:{
      type: String,
    },
  },

  country: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  about: {
    type: String, 
    required: false, 
  },
  user_type: {
    type: String,  
  },

  updated_at: Date,
});
const Users = mongoose.model("users", UserSchema);
//const findUsers = (query) => UserModel.find(query);
module.exports = Users;

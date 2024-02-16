const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const StatesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  state_id: {
    type: Number,
  },
  country_id: {
    type: Number,
  },
  country_code: {
    type: String,
  },
  country_name: {
    type: String,
  },
  state_code: {
    type: String,
  },
  },{
    timestamps: false,
    versionKey: false
})

const States =  mongoose.model('states', StatesSchema)
module.exports =  States;
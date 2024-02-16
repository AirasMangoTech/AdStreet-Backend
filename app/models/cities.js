const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const CitiesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  city_id: {
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
  state_id: {
    type: Number
  },
  state_name: {
    type: String,
  },
  },{
    timestamps: false,
    versionKey: false
})

const Cities =  mongoose.model('cities', CitiesSchema)
module.exports =  Cities;
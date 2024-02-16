const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const CountriesSchema = new mongoose.Schema({
  country_id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone_code: {
    type: String,
  },
  currency: {
    type: String,
  },
  iso2: {
    type: String,
  },
  iso3: {
    type: String,
  }
  },{
    timestamps: false,
    versionKey: false
})

const Countries =  mongoose.model('countries', CountriesSchema)
module.exports =  Countries;
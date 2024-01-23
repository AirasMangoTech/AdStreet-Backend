const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const newQuerySchema = new mongoose.Schema({
  service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  summary: {
    name: {type: String},
    price:  {type: Number},
    pricing_type:  {type: String},
    price_per_maid: {
      type: Number,
    },
    material_price: {
      type: Number,
    },
    notes:  {type: String},
    type:  {type: String},
    house_type: {type: String},
    packages: {type: String}
  },
  frequency: [{date: Date, slot: String, maids: Number, hours: Number, sqft: Number, cleaning_material: Boolean}],
  contact: {
    name: String,
    number: String,
    email: String,
    address: String,
    latitude: Number,
    longitude: Number,
    postal_code: String,
    building: String,
    flat: String,
    city: String
  },
  payment: {
    sub_total: Number,
    total: Number,
    method: String,
    status: String
  }
}, { versionKey: false, timestamps: true });

const NewQuery =  mongoose.model('new_queries', newQuerySchema)
module.exports =  NewQuery;
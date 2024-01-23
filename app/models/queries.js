const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
  service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  summary: {
    name: String,
    image: String,
    price: Number,
    pricing_type: {
      type: String,
    },
    price_per_maid: {
      type: Number,
      required: true
    },
    cleaning_material: {
      type: Boolean,
      default: true
    },
    hours: Number,
    sqft: Number,
    maids: Number,
    notes: String
  },
  frequency: {
    type: {
      type: String,
    },
    days: [String], // Array of days like: ['monday', 'tuesday', ...]
    dates: [String], // Array of dates like: [1, 2, 3, 4, 5]
    slot: [String], // Array of slots like: ['morning', 'afternoon']
    weeks: Number,
    months: [String],
    months_count: Number,
  },
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
    material: Number,
    total: Number,
    method: {
      type: String,
    },
    status: {
      type: String,
    }
  }
}, { versionKey: false, timestamps: true });

const Query =  mongoose.model('queries', querySchema)
module.exports =  Query;
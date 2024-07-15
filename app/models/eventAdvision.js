const mongoose = require("mongoose");

const eventAdvisionSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
    },
    companyName: {
        type: String,
    },
    noOfTables: {
        type: Number,
    },
    category: {
        type: String,
    },
    price: {
        type: Number,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const eventAdvision = mongoose.model("eventAdvision", eventAdvisionSchema);

module.exports = eventAdvision;

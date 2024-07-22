const mongoose = require("mongoose");

const eventDragonSchema = new mongoose.Schema({
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
    noOfSeats: {
        type: Number,
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

const eventDragon = mongoose.model("eventDragon", eventDragonSchema);

module.exports = eventDragon;

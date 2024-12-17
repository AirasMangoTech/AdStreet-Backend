const mongoose = require("mongoose");

const eventFieldSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    value: {
        type: String,
    }, 
});

const eventField = mongoose.model("eventField", eventFieldSchema);

module.exports = eventField;

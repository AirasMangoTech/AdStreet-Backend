const mongoose = require("mongoose");
require('dotenv').config()

let dbURL = (process.env.NODE_ENV == "PRODUCTION") ? process.env.DATABASE_LIVE : process.env.DATABASE

mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology : true
}).then(() => {
    console.log("Connected to DB")
}).catch((e) => {
    console.trace('Inside Catch => ', e);
})


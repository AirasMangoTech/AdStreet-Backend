const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const path = require("path");
require('./app/config/database');
const app_route = require('./app/routes/index');

const app = express();

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//app.use('/uploads', express.static('uploads'));
app.use(cors({
    origin: ['http://localhost:3002']
}));

const port=process.env.PORT||8035

app.get("/", (req, res) => {
    res.json({ message: "Codename: Project Ad Street" });
  });
app.use("/api",app_route)
app.listen(port, () => {
    console.log(`server is running on ${port}`)
})
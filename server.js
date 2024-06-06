const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
require("./app/config/database");
const app_route = require("./app/routes/index");
const chatRoutes = require("./app/routes/chat.routes");

const app = express();
const server = http.createServer(app);

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploadFiles", express.static(path.join(__dirname, "uploadFiles")));
//app.use('/uploads', express.static('uploads'));

app.use(
  cors({
    origin: [
      "http://localhost:3002",
      "https://adstreet-db.surge.sh",
      "http://localhost:3000",
      "https://adstreet.surge.sh",
      "https://adstreet.axsonstech.com",
      "https://adstreet-dashboard.axsonstech.com",
      "http://192.168.18.66:3002",
      "https://adstreet.mangotech-api.com",
    ],
  })
);

const port = process.env.PORT || 8035;

app.get("/", (req, res) => {
  res.json({ message: "Codename: Project Ad Street" });
});
app.use("/api", app_route);

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});

const io = socketio(server).sockets;
require("./app/service/chatService")(io);

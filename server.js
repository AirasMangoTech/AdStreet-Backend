const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
require("./app/config/database");
const app_route = require("./app/routes/index");
const chatRoutes = require("./app/routes/chat.routes");
const Blog = require("./app/models/blogs");
const cron = require("node-cron");
const adManager = require("./app/utils/adManager");

const app = express();
const server = http.createServer(app);

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// set view engine for ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "app/views"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));
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
      "http://adstreet.axsonstech.com",
      "http://adstreet.com.pk",
      "https://adstreet.com.pk",
      "http://www.adstreet.com.pk",
      "https://www.adstreet.com.pk",
      "https://adstreetweb.surge.sh",
      "https://admin.adstreet.com.pk",
    ],
  })
);

const port = process.env.PORT || 8035;

app.get("/", (req, res) => {
  res.json({ message: "Codename: Project Ad Street" });
});

app.get("/payment-failed", (req, res) => {
  res.render("cancel");
});

app.get("/share/:id", async (req, res) => {
  const id = req.params.id;
  const blog = await Blog.findById(id);
  res.render("index", {
    title: blog.title,
    image: blog.image,
    url: `https://adstreet.com.pk/adleaks-blog/${id}`,
  });
});

app.get("/ad/:id", (req, res) => {
  const adId = req.params.id;

  const androidAppScheme = `adstreet://ad/${adId}`;
  const iosAppScheme = `adstreet://ad/${adId}`;

  const playStoreUrl =
    "https://play.google.com/store/apps/details?id=com.axsonstech.adstreet";
  const appStoreUrl =
    "https://apps.apple.com/us/app/adstreet/idYOUR_APPLE_APP_ID";

  const webUrl = `https://adstreet.mangotech-api.com/ad/${adId}`;

  const userAgent = req.headers["user-agent"];
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isMobile = isAndroid || isIOS;
  const isDesktop = !isMobile;

  if (isDesktop) {
    return res.redirect(playStoreUrl);
  }

  let fallbackUrl = isAndroid ? playStoreUrl : isIOS ? appStoreUrl : webUrl;

  res.send(`
        <html>
            <head>
                <script>
                    setTimeout(function() {
                        window.location.href = "${fallbackUrl}";
                    }, 2000);

                    window.location.href = "${
                      isIOS ? iosAppScheme : androidAppScheme
                    }";
                </script>
            </head>
            <body>
                <p>Redirecting...</p>
            </body>
        </html>
    `);
});

app.use("/api", app_route);

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});

cron.schedule("0 0 * * *", () => {
  console.log("Running ad manager at midnight");
  adManager();
});

const io = socketio(server).sockets;
require("./app/service/chatService")(io);

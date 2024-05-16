const admin = require("firebase-admin");
const serviceAccount = require("../../adstreet-56091-firebase-adminsdk-w0h71-367031c77b.json");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = { firebase };
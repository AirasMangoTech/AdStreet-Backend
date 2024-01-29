const admin = require("firebase-admin");
const serviceAccount = require("../../mynda-4edb5-firebase-adminsdk-friki-f8e250a385.json");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = { firebase };
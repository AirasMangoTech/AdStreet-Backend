const { firebase } = require("../config/firebase");

const sendNotification = async (title, body, data, token) => {
  try {
    const payload = {
      notification: {
        title: title,
        body: body,
      },
      token: token,
      data: { obj: JSON.stringify(data) },
    };
    await firebase
      .messaging()
      .send(payload)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });

    return true;
  } catch (error) {
    //console.log(error);
    return error;
  }
};

module.exports = sendNotification;

// exports.sendNotification = ({
//   title,
//   body,
//   fcmToken,
//   data,
//   priority = "normal",
// }) => {
//   const serverKey = process.env.FIREBASE_SERVER_KEY;
//   const fcm = new FCM(serverKey);

//   const message = {
//     to: fcmToken,
//     priority,
//     notification: {
//       title,
//       body,
//     },
//     data,
//   };

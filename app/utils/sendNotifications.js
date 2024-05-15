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
      })
      .catch((error) => {
      });
      console.log("im running")
    return true;
    
  } catch (error) {
    return error;
  }
};

module.exports = sendNotification;

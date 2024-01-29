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
    console.log(error);
    return error;
  }
};

module.exports = sendNotification;

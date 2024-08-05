const axios = require('axios');

const verifyGoogleToken = async (token) => {
  try {
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    return response.data; // Returns the user information from Google

  } catch (error) {
    throw new Error('Invalid Google token');
  }
};

const verifyFacebookToken = async (token, userId) => {
  try {
    const response = await axios.get(`https://graph.facebook.com/${userId}?access_token=${token}`);
    return response.data; // Returns the user information from Facebook
  } catch (error) {
    throw new Error('Invalid Facebook token');
  }
};

module.exports = {
  verifyGoogleToken,
  verifyFacebookToken
};

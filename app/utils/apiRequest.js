const axios = require('axios');

const sendRequest = async (url, data) => {
    try {
        const response = await axios.post(url, data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : { message: error.message };
    }
}

module.exports = {sendRequest}
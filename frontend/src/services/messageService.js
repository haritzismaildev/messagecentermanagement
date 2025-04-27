import axios from 'axios';

// const API_URL = process.env.REACT_APP_BACKEND_URL;
// const API_URL = process.env.REACT_APP_GO_BACKEND_URL;

// Gunakan base URL untuk golang-backend yang mengelola komunikasi dengan Twilio
const TWILIO_API_URL = process.env.REACT_APP_GO_BACKEND_URL;

// export const sendMessage = async (messageData) => {
//   try {
//     const response = await axios.post(`${API_URL}/message/send`, messageData);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

// export const bulkMessaging = async (bulkData) => {
//   try {
//     const response = await axios.post(`${API_URL}/message/bulk`, bulkData);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };

/**
 * Mengirim pesan individual melalui Twilio.
 * @param {object} messageData - Data pesan, misalnya { to, body }
 * @returns {object} - Respons dari server.
 */
export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(`${TWILIO_API_URL}/api/message/send`, messageData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Mengirim pesan massal (bulk messaging) melalui Twilio.
 * @param {object} bulkData - Data bulk, misalnya { recipients: [list of numbers], body }
 * @returns {object} - Respons dari server.
 */
export const bulkMessaging = async (bulkData) => {
  try {
    const response = await axios.post(`${TWILIO_API_URL}/api/message/bulk`, bulkData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getChatLogs = async () => {
  try {
    const response = await axios.get(`${TWILIO_API_URL}/chatlogs`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
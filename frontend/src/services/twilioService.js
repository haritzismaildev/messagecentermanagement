import axios from 'axios';

// Gunakan base URL untuk golang-backend yang menangani Twilio
const GO_API_URL = process.env.REACT_APP_GO_BACKEND_URL;

/**
 * Kirim pesan melalui Twilio.
 * @param {object} messageData - Data pesan, misalnya { to, body, attachments }
 * @returns {object} Respons dari backend.
 */
export const sendTwilioMessage = async (messageData) => {
  try {
    const response = await axios.post(`${GO_API_URL}/api/send-twilio-message`, messageData);
    return response.messageData;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

/**
 * Fungsi untuk bulk messaging melalui Twilio.
 * @param {object} bulkData - Data bulk, misalnya { recipients: [list], body }
 * @returns {object} Respons dari backend.
 */
export const bulkTwilioMessaging = async (bulkData) => {
  try {
    const response = await axios.post(`${GO_API_URL}/send-twilio-message/bulk`, bulkData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
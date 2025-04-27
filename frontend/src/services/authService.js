/** Define & Imports */
import axios from 'axios';
//import { data } from 'react-router-dom';

// const API_URL = process.env.REACT_APP_BACKEND_URL;

// Base URL untuk backend (pastikan REACT_APP_BACKEND_URL sudah disetel di file .env frontend)
const API_URL = process.env.REACT_APP_BACKEND_URL;

// /**  Tambahkan fungsi lain : */
// /** Users Get */
// export const GetUsers = async (data, finalAuthToken) => {
//     const response = await axios.get(`${API_URL}/users`, data, {
//         headers: { 'x-final-auth': finalAuthToken },
//       });
//       return response.data;
// };
// /** registerUser, */
// export const registerUser = async (data, finalAuthToken) => {
//     const response = await axios.post(`${}`)
// };
// /** loginUser */
// /** verifyOTP */
// export const verifyOTP = async (data, finalAuthToken) => {
//     const response = await axios.post(`${API_URL}/auth/verify-otp`, data, {
//       headers: { 'x-final-auth': finalAuthToken },
//     });
//     return response.data;
//   };
//  /** dsb. */

/**
 * Register a new user.
 * @param {object} userData - { email, password, role }
 * @returns {object} response data dari server.
 */
export const registerUser = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };
  
  /**
   * Login and generate OTP.
   * @param {object} credentials - { email, password }
   * @returns {object} response data (contoh: { msg: 'OTP has been sent to your email. Please verify.' })
   */
  export const loginUser = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };
  
  /**
   * Verify OTP and complete login.
   * @param {object} data - { email, otp }
   * @param {string} finalAuthToken - Token final (misalnya, dari environment REACT_APP_FINAL_AUTH_TOKEN)
   * @returns {object} response data yang mengandung JWT token.
   */
  export const verifyOTP = async (data, finalAuthToken) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, data, {
        headers: { 'x-final-auth': finalAuthToken },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };
  
  /**
   * Retrieve all users.
   * @returns {array} list of users.
   */
  export const getAllUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };
  
  /**
   * Update user by ID.
   * @param {string} id - User ID.
   * @param {object} updateData - Data yang akan diperbarui (misalnya, { email, password, role }).
   * @param {string} token - JWT token untuk otorisasi.
   * @returns {object} response data.
   */
  export const updateUser = async (id, updateData, token) => {
    try {
      const response = await axios.put(`${API_URL}/user/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };
  
  /**
   * Delete user by ID.
   * @param {string} id - User ID.
   * @param {string} token - JWT token untuk otorisasi.
   * @returns {object} response data.
   */
  export const deleteUser = async (id, token) => {
    try {
      const response = await axios.delete(`${API_URL}/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };  
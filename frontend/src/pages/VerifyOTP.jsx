import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOTP } from '../services/authService';
import './VerifyOTP.css'; // Buat file CSS jika diperlukan untuk styling

const VerifyOTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const navigate = useNavigate();

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const resp = await verifyOTP({ email, otp }, process.env.REACT_APP_FINAL_AUTH_TOKEN);
      localStorage.setItem('token', resp.token);
      alert(resp.msg);
      navigate('/dashboard');
    } catch (error) {
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);
      if (newAttempts >= 5) {
        alert("Anda sudah 5 kali salah OTP. Silakan login ulang.");
        navigate('/login');
      } else {
        alert("OTP salah. Percobaan: " + newAttempts);
      }
    }
  };

  return (
    <div className="verify-otp-container">
      <h2>Verify OTP</h2>
      <form onSubmit={handleVerifyOtp}>
        <div className="input-box">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-box">
          <label>OTP</label>
          <input
            type="text"
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn">Verify OTP</button>
      </form>
      <button onClick={() => navigate('/login')} className="back-btn">Back to Login</button>
    </div>
  );
};

export default VerifyOTP;
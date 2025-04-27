// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./login.css"; // Import CSS khusus login
import axios from "axios";

export default function Login() {
  // step untuk login step
  const [step, setStep] = useState(1);    // 1 = login, 2 = otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State untuk OTP
  const [otp, setOtp] = useState("");
  const [otpAttempts, setOtpAttempts] = useState(0); // untuk hitungan salah input

  const navigate = useNavigate();

  // Handle login pertama
  async function handleLogin(e) {
    e.preventDefault();
    try {
      // panggil endpoint nodejs
      const resp = await axios.post("http://localhost:3881/auth/login", {
        email,
        password,
      });

      // Misalnya server balas: { msg: 'OTP has been sent to your email.' }
      if (resp.data.msg?.includes("OTP has been sent")) {
        window.alert("OTP sent to email: " + email);
        // Masuk ke step OTP
        setStep(2);
      } else {
        // Kalau balasan server berbeda, misalnya timbul error
        window.alert("Login Failed: " + resp.data.msg);
      } 
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  }

  // handle verifikasi OTP
  async function handleVerifyOtp(e) {
    e.preventDefault();
    try {
      const resp = await axios.post("http://localhost:3881/auth/verify-otp", {
        email,
        otp,
      }, {
        // header x-final-auth jika server butuh
        headers: {
          "x-final-auth": "MySuperFinalToken123"  // ganti sesuai .env server
        }
      });
      // Jika sukses, server kirim: { token, msg: 'Login successful' }
      localStorage.setItem("token", resp.data.token);
      alert("Login success!");
      navigate("/dashboard");
    } catch (error) {
      // OTP salah
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);
      if (newAttempts >= 5) {
        alert("Anda sudah 5 kali salah OTP. Silakan login ulang.");
        // Kembalikan ke step 1 (login)
        setStep(1);
        setOtpAttempts(0);
      } else {
        alert("Wrong OTP. Attempts: " + newAttempts);
      }
    }
  }

return (
  <div className="login-container">
    {/* Animasi Blinking */}
    {[...Array(50).keys()].map((i) => (
      <span key={i} style={{ "--i": i }} />
    ))}

    {/* Form Login Box */}
    <div className="login-box">
      {step === 1 && (
        <>
          {/* Logo / Title */}
          <div className="logo-container">
            <img src="../images/TWLO_BIG.png" alt="Twilio Logo" className="logo" />
          </div>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-box">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Email</label>
            </div>
            <div className="input-box">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
            </div>
            <div className="forgot-pass">
              <a href="#/">Forgot your password?</a>
            </div>
            <button type="submit" className="btn">Login</button>
            <div className="signup-link">
              <a href="#/">Signup</a>
            </div>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <div className="logo-container">
            <img src="../images/TWLO_BIG.png" alt="Twilio Logo" className="logo" />
          </div>
          <h2>Enter Your 4-Digit OTP</h2>
          <form onSubmit={handleVerifyOtp}>
            <div className="input-box">
              <input
                type="text"
                required
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <label>OTP</label>
            </div>
            <p>Check your email ({email}) for 4-digit OTP code.</p>
            <button type="submit" className="btn">Verify OTP</button>
          </form>
          <p style={{ marginTop: "10px", textAlign: "center" }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#0ef', cursor: 'pointer' }}
              onClick={() => {
                // Kembali ke form login
                setStep(1);
                setOtpAttempts(0);
              }}
            >
              Back to Login
            </button>
          </p>
        </>
      )}
    </div>
  </div>
);
}
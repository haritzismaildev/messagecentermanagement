const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('./Model/User'); // Pastikan file model User.js berada di lokasi yang benar
const OTP = require('./Model/OTP');  // Model OTP
const BackupOTP = require('./Model/OTPBackup');
const { sendToQueue } = require('./messageBroker');
const jwt = require('jsonwebtoken');
const checkRole = require('./roleMiddleware');
const authMiddleware = require('./authMiddleware');

/**
 * Endpoint untuk register user baru.
 * Request Body harus mengandung: 
 *   - email (string)
 *   - password (string)
 *   - role (opsional, default: "agent")
 */

// Setup transporter untuk nodemailer menggunakan variabel environment
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true', // jika false, maka akan menggunakan TLS secara otomatis
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email dan password harus disediakan.' });
    }
    
    // Cek apakah user sudah ada
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User sudah terdaftar.' });
    }
    
    // Hash password dengan bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Buat user baru
    const newUser = new User({
      email,
      passwordHash,
      role: role || 'agent' // Jika role tidak diberikan, defaultnya "agent"
    });
    
    // Simpan user ke database
    await newUser.save();
    
    console.log('User berhasil disimpan:', newUser);
    
    // Kembalikan respons sukses
    return res.status(201).json({ 
      msg: 'User registered successfully', 
      user: newUser 
    });
  } catch (error) {
    console.error('Error in registration:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: 'Email and password required' });
    
    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: 'Invalid credentials' });
    
    // Bandingkan password dengan hash yang tersimpan
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(400).json({ msg: 'Invalid credentials' });
    
    // Cek apakah ada OTP yang belum expired untuk user ini
    const existingOTP = await OTP.findOne({ userId: user._id });
    // buat validasi apakah hasil temuannya masih valid atau sudah expired
    if (existingOTP && existingOTP.expiresAt > new Date()) {
      // OTP ternyata masih valid atau belum expires, maka lakukan saja pengiriman ulang email  dengan OTP yang lama
      console.log("OTP existing still valid: ", existingOTP.code);
      // Misal kirim ulang email (opsional) dan kembalikan response
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${existingOTP.code}. It will expire at ${existingOTP.expiresAt.toLocaleTimeString()}.`
      };
      await transporter.sendMail(mailOptions);
      return res.json({ msg: 'OTP has been sent to your email (using existing OTP). Please verify.' });
    }
    
    // jika tidak ada otp atau sudah expires, maka lakukan generate OTP baru
    // Generate kode OTP 4 digit
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    // Tetapkan waktu expired (5 menit ke depan)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);  // 5 menit kedepan
    
    console.log("Current time:", new Date());
    console.log("Calculated expiresAt:", expiresAt);

    // Simpan OTP baru ke database
    let otpRecord;
    try {
      otpRecord = await OTP.create({
        userId: user._id,
        code: otpCode,
        email: user.email,
        username: user.email,
        ipAddress: req.ip,
        expiresAt: expiresAt,
      });
      // Simpan juga ke collection backup
      await BackupOTP.create({
        userId: user._id,
        code: otpCode,
        email: user.email,
        username: user.email,
        ipAddress: req.ip,
        expiresAt: expiresAt,
      });
    } catch (createErr) {
      console.error("Error saving OTP:", createErr);
      return res.status(500).json({ msg: 'Server error while saving OTP' });
    }
    console.log("OTP record created:", otpRecord);

    // Siapkan opsi email untuk mengirim OTP
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otpCode}. It will expire in 5 minutes.`
    };
    // Kirim email menggunakan nodemailer
    await transporter.sendMail(mailOptions);
    
    // Publikasikan event login ke RabbitMQ
    sendToQueue('user.login.initiated', { userId: user._id, email: user.email });
    
    // Kirim respons bahwa OTP sudah dikirimkan
    res.json({ msg: 'OTP has been sent to your email. Please verify.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ msg: 'Email and OTP required' });
    }
    
    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email' });
    }
    
    // Cari OTP yang sesuai untuk user tersebut
    const otpEntry = await OTP.findOne({ userId: user._id, code: otp });
    if (!otpEntry) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }
    
    // Periksa apakah OTP sudah expired
    if (otpEntry.expiresAt < new Date()) {
      return res.status(400).json({ msg: 'OTP expired' });
    }
    
    // Hapus OTP setelah verifikasi agar tidak bisa dipakai lagi, tetapi hanya dari collection primary saja
    await OTP.deleteOne({ _id: otpEntry._id });
    
    // Validasi token final dari header 'x-final-auth'
    if (req.headers['x-final-auth'] !== process.env.FINAL_AUTH_TOKEN) {
      return res.status(401).json({ msg: 'Final authentication failed' });
    }
    
    // Generate JWT token dengan payload userId dan role, token berlaku 2 jam
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    
    // (Opsional) Simpan token ke database pada record user agar tersimpan
    user.jwtToken = token;
    await user.save();
    
    // Publikasikan event login selesai ke RabbitMQ
    sendToQueue('user.login.completed', { userId: user._id, email: user.email });
    
    // Kembalikan JWT token ke client
    res.json({ token, msg: 'Login successful' });
  } catch (err) {
    console.error('OTP Verification error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// untuk fungsi/method updated
router.put('/user/:id', authMiddleware, checkRole(['superadmin', 'owner']), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // Lakukan update field email, password, dsb. 
    // (Disingkat untuk contoh)
    if (email) user.email = email;
    if (password) {
      // proses hashing dsb.
    }

    // Update role hanya jika disediakan
    if (role) {
      // Pastikan role baru valid (cs, admin, superadmin, owner)
      user.role = role;
    }

    await user.save();
    res.json({ msg: 'User updated successfully', user });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// untuk fungsi delete
router.delete('/user/:id', authMiddleware, checkRole(['superadmin','owner']), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // Publish event delete
    sendToQueue('user.deleted', { userId: user._id, email: user.email });
    
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
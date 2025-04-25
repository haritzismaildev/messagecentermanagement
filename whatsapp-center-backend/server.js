const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const ChatLog = require('./Model/ChatLog');

const cors = require('cors');

const app = express();
app.use(express.urlencoded({ extended: true }));

const port = 3881;
const path = require('path');

// define cors
const corsOptions = {
  origin: 'http://localhost:3000', // Atau array: ['http://localhost:3000','https://your-frontend.com']
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  // optionsSuccessStatus: 204  // opsional
}

// setelah define, gunakan sebelum definiskan route
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Koneksi ke database (db.js)
const { connectDB } = require('./db');
connectDB();

// Inisialisasi RabbitMQ
const { initBroker } = require('./messageBroker');
initBroker();

// Routing endpoint API yang sudah ada (misal untuk message, auth, dsb)
const authRouter = require('./authRoutes');
app.use('/auth', authRouter);

// Gunakan router userRoutes untuk endpoint user management
const userRouter = require('./userRoutes');
app.use('/', userRouter);

// Swagger setup
const { swaggerUi, swaggerSpec } = require('./swagger');
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customJs: '/custom-swagger.js'
}));

// Endpoint lainnya (contoh)
app.get('/', (req, res) => {
  res.send('Hello from Node.js + MongoDB Cloud Database Atlas');
});

// Definisikan route GET /api/messages
app.get('/api/messages', (req, res) => {
  // Contoh data statis, nanti Anda bisa ganti dengan data dari DB
  const messages = [
    { from: 'whatsapp:+628xxx', body: 'Hello inbound' },
    { from: 'whatsapp:+628yyy', body: 'Another message' },
  ];
  res.json(messages);
});

/************************************************
 * 1. ENDPOINT UNTUK MENERIMA PESAN INBOUND (TWILIO)
 *    Twilio akan POST ke route ini:
 *    misalnya "/twilio-webhook"
 ************************************************/
app.post('/twilio-webhook', async (req, res) => {
  try {
    // Twilio default form fields:
    // "From" => "whatsapp:+628xxx"
    // "Body" => isi pesan
    const from = req.body.From; 
    const body = req.body.Body;

    // Simpan ke MongoDB (collection "chatlogs")
    await ChatLog.create({ from, body });

    // Twilio butuh respon 200 OK
    return res.sendStatus(200);
  } catch (err) {
    console.error("Error inbound message:", err);
    return res.status(500).send("Error saving inbound message");
  }
});

/************************************************
 * 2. ENDPOINT GET UNTUK MENGAMBIL DATA chatlogs
 *    Golang-backend (atau client) bisa memanggil
 *    "/api/chatlogs" untuk mendapatkan semua pesan inbound.
 ************************************************/
app.get('/api/chatlogs', async (req, res) => {
  try {
    // Ambil semua data dari collection chatlogs, urutkan dari yang terbaru
    // Gunakan sort({ timestamp: -1 }) agar data terbaru muncul lebih dulu
    const logs = await ChatLog.find({}).sort({ timestamp: +1 });

    // Balikkan dalam format JSON
    return res.json(logs);
  } catch (err) {
    console.error("Error getting chatlogs:", err);
    return res.status(500).json({ error: "Failed to get chatlogs" });
  }
});

// Sajikan file statis dari folder "public"
app.use(express.static(path.join(__dirname, 'public')));

// ini untuk cors
app.use(cors());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
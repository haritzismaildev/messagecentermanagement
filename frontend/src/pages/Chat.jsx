import React, { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import axios from 'axios';
import { sendTwilioMessage, bulkTwilioMessaging } from '../services/twilioService';
import { fetchInboundMessages } from '../services/twilioWebhookService';

const Chat = () => {

const [messages, setMessages] = useState([]);

useEffect(() => {
  // poling tiap 3 detik
  const interval = setInterval(() => {
    getInboundMessages();
  }, 3000);
  return () => clearInterval(interval);
}, []);

const getInboundMessages = async () => {
  try {
    const data = await fetchInboundMessages();
    console.log("Inbound messages data:", data); // Debug: cek isi data
    // asumsi data = [{ from, body, time, dsb. }]
    // transform ke format chatWindow, misal :
    const mapped = data.map(msg => ({
      sender: msg.from === 'me' ? 'me' : 'other',
      body: msg.body,
      type: 'text'
    }));
    setMessages(mapped);
  } catch (error) {
    console.error("Failed to fetch inbound messages:", error);
  }
};

// Fungsi untuk mengirim pesan teks
    const handleSendMessage = async (text) => {
        // Misal, kita tentukan nomor penerima secara statis atau dinamis
        const messageData = { to: '+62811270171', body: text, type: 'text' };
        try {
        const data = await sendTwilioMessage(messageData);
        // Setelah respons sukses, update state pesan untuk menampilkan pesan baru
        setMessages(prev => [...prev, { sender: 'me', body: text, type: 'text' }]);
        } catch (error) {
        alert('Failed to send message: ' + (error.msg || 'Unknown error'));
        }
  };

  // Fungsi untuk mengirim file attachment
  const handleSendFile = async (file) => {
    try {
      // Persiapkan FormData untuk upload file
      const formData = new FormData();
      formData.append('file', file);
      // Misalnya, endpoint upload file di golang-backend: /api/message/upload-file
      const uploadResponse = await axios.post(
        `${process.env.REACT_APP_GO_BACKEND_URL}/api/message/upload-file`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      // Setelah upload berhasil, dapatkan URL file dari respons
      const fileUrl = uploadResponse.data.fileUrl;
      // Siapkan payload pesan dengan attachment
      const messageData = {
        to: '+6281234567890',
        body: '', // Kosong karena kita mengirim file
        type: 'file',
        fileUrl,
        fileName: file.name
      };
      const data = await sendTwilioMessage(messageData);
      // Update state pesan untuk menampilkan pesan file
      setMessages(prev => [...prev, { sender: 'me', type: 'file', fileUrl, fileName: file.name }]);
    } catch (error) {
      alert('Failed to send file: ' + (error.msg || 'Unknown error'));
    }
  };

  // (Opsional) Fungsi untuk bulk messaging
  // Fungsi ini mungkin lebih tepat diletakkan di halaman terpisah,
  // tetapi berikut contoh singkatnya:
  const handleBulkMessaging = async (bulkData) => {
    // bulkData: { recipients: [ '+6281234567890', ... ], body: "Your message" }
    try {
      const data = await bulkTwilioMessaging(bulkData);
      alert('Bulk message sent successfully.');
      // Bulk messaging biasanya tidak langsung ditampilkan di chat window.
    } catch (error) {
      alert('Error sending bulk message: ' + (error.msg || 'Unknown error'));
    }
  };

  return (
<div style={{ height: '100vh' }}>
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
      />
      {/* Jika ingin menguji bulk messaging, Anda bisa menambahkan form atau tombol khusus di sini */}
    </div>
  );
};

export default Chat;
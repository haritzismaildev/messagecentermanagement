import React, { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import axios from 'axios';
// import { sendTwilioMessage, bulkTwilioMessaging } from '../services/twilioService';
import { sendTwilioMessage} from '../services/twilioService';
import { fetchInboundMessages } from '../services/twilioWebhookService';

const Chat = () => {
const [messages, setMessages] = useState([]);

useEffect(() => {
  // Panggil sekali saat komponent untuk data awal
  getInboundMessages();

  // poling tiap 3 detik
  const interval = setInterval(() => {
    getInboundMessages();
  }, 3000);// Pertimbangkan interval yang lebih panjang atau gunakan WebSocket/SSE jika memungkinkan

  // Cleanup interval saat komponen unmount
  return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // getInboundMessages didefinisikan di luar dan tidak berubah, jadi array kosong dibenarkan di sini, atau gunakan useCallback jika getInboundMessages bergantung pada state/props

// Fungsi untuk mengambil pesan masuk (polling)
const getInboundMessages = async () => {
  try {
    //const data = await fetchInboundMessages();
    const inboundData = await fetchInboundMessages();
    console.log("Inbound messages data:", inboundData); // Debug: cek isi data

    // Periksa apakah inboundData adalah array sebelum mapping
    if (Array.isArray(inboundData)) {
      const mapped = inboundData.map(msg => ({
        sender: msg.from === 'me' ? 'me' : 'other',
        body: msg.body,
        type: 'text'
      }));
      setMessages(mapped);
    } else {
      console.warn("fetchInboundMessages did not return an array:", inboundData);
    }
    // setMessages(mapped);
  } catch (error) {
    console.error("Failed to fetch inbound messages:", error);
  }
};

// Fungsi untuk mengirim pesan teks
    const handleSendMessage = async (text) => {
        // Misal, kita tentukan nomor penerima secara statis atau dinamis
        const messageData = { to: '+628165457472', body: text, type: 'text' };
        try {
        // const data = await sendTwilioMessage(messageData);
        
        // Tidak perlu menyimpan hasil ke 'data' jika tidak digunakan
        await sendTwilioMessage(messageData);
        
        // Setelah respons sukses, update state pesan untuk menampilkan pesan baru
        setMessages(prev => [...prev, { sender: 'me', body: text, type: 'text' }]);
        } catch (error) {
          // Berikan feedback error yang lebih baik daripada alert
          console.error('Failed to send message:', error);
          //alert('Failed to send message: ' + (error.msg || 'Unknown error'));
          alert('Failed to send message: ' + (error.response?.data?.msg || error.message || 'Unknown error'));
        }
  };

  // Fungsi untuk mengirim file attachment
  const handleSendFile = async (file) => {
    
      // Persiapkan FormData untuk upload file
      const formData = new FormData();
      formData.append('file', file);

      try {
        // 1. Upload file ke backend Anda
        const uploadResponse = await axios.post(
          `${process.env.REACT_APP_GO_BACKEND_URL}/api/message/upload-file`, // Pastikan URL benar
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        const fileUrl = uploadResponse.data.fileUrl; // Pastikan backend mengembalikan { fileUrl: '...' }
  
        if (!fileUrl) {
          throw new Error("File URL not received from backend");
        }
  
        // 2. Kirim pesan Twilio dengan URL media
        const messageData = {
          to: '+6281234567890', // Ganti 'to' sesuai kebutuhan
          body: '', // Body bisa kosong atau berisi nama file jika diinginkan
          type: 'file', // Tipe custom Anda
          fileUrl, // URL yang akan dikirim via Twilio (jika Twilio mendukungnya langsung) atau untuk disimpan/ditampilkan
          fileName: file.name
        };
  
        // Tidak perlu menyimpan hasil ke 'data' jika tidak digunakan
        await sendTwilioMessage(messageData); // Asumsi sendTwilioMessage bisa handle type 'file'
  
        // Optimistic UI update
        setMessages(prev => [...prev, { sender: 'me', type: 'file', fileUrl, fileName: file.name }]);
      } catch (error) {
        console.error('Failed to send file:', error);
        // Cek error dari axios atau error custom
        let errorMessage = 'Unknown error';
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.msg || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        alert('Failed to send file: ' + errorMessage);
      }
    };

  return (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Mungkin tambahkan header atau elemen UI lain di sini */}
      <div style={{ flex: 1, overflowY: 'auto' }}> {/* Buat area chat scrollable */}
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
      />
      </div>
      {/* Jika ingin menguji bulk messaging, Anda bisa menambahkan form atau tombol khusus di sini */}
      {/* <button onClick={() => handleBulkMessaging({ recipients: ['...'], body: 'Test' })}>Send Bulk</button> */}
    </div>
  );
};

export default Chat;
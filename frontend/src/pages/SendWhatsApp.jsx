import React from 'react';
import './sendWhatsApp.css'; // Pastikan path ini benar

export default function SendWhatsApp() {
  return (
    <div className="whatsapp-web-container">
      {/* Kolom kiri: box putih dengan QR code & instruksi */}
      <div className="whatsapp-left">
        <div className="whatsapp-header">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp Logo"
            className="whatsapp-logo"
          />
          <span className="header-title">WhatsApp Web</span>
        </div>
        <div className="instruction-box">
          <h2>To use WhatsApp on your computer:</h2>
          <ol>
            <li>Open WhatsApp on your phone</li>
            <li>Tap <strong>Menu</strong> or <strong>Settings</strong> and select <strong>Linked Devices</strong></li>
            <li>Point your phone to this screen to capture the code</li>
          </ol>
          <div className="qr-code">
            {/* Ganti dengan gambar QR code yang valid */}
            <img
              src="https://via.placeholder.com/220x220?text=QR+Code"
              alt="QR Code"
            />
          </div>
        </div>
        <div className="footer-info">
          <p>
            This is a sample UI, not an official WhatsApp site.
          </p>
        </div>
      </div>

      {/* Kolom kanan: background hijau/ilustrasi dan konten tambahan */}
      <div className="whatsapp-right">
        <div className="right-content">
          {/* Bagian logo WhatsApp dan teks */}
          <div className="whatsapp-logo-section">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp Logo"
              className="whatsapp-logo-right"
            />
            <span className="whatsapp-web-text">WhatsApp Web</span>
          </div>

          {/* Bagian iklan */}
          <div className="ads-section">
            <img
              src="https://images.ctfassets.net/2vbtnveccz5s/8b2mSz2SYjBfQf89ketdl/a9fc2a5195cf24777ee0e58aa904191c/whatsapp_logo.png"
              alt="Iklan 1"
              className="ad-image"
            />
            <img
              src="https://www.kommo.com/static/images/pages/integrations/logo/logo-twilio.jpg"
              alt="Iklan 2"
              className="ad-image"
            />
            {/* Tambahkan lebih banyak iklan sesuai kebutuhan */}
          </div>
        </div>
      </div>
    </div>
  );
}

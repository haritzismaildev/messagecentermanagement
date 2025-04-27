// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Home.css"; // Pastikan untuk membuat atau menyesuaikan CSS

export default function Home() {
  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        {/* Pintasan Menu Utama */}

        <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
          <Link to="/whatsapp-center" className="small-box bg-success">
            <div className="inner text-center">
            <img
                src="./images/whatsapp-logo-png-2281.png" /* Pastikan path benar */
                alt="WhatsApp Center Logo"
                className="mb-3"
                style={{ width: "80px" }}
              />
              <h3>WhatsApp Center</h3>
              <p>Manage WhatsApp Center</p>
            </div>
            <div className="icon">
              <i className="fas fa-comments"></i>
            </div>
            <div className="small-box-footer">
              More info <i className="fas fa-arrow-circle-right"></i>
            </div>
          </Link>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
          <Link to="/usman" className="small-box bg-info">
            <div className="inner text-center">
              <img
                src="./images/icons8-user.gif" /* Pastikan path benar */
                alt="usman Logo"
                className="mb-3"
                style={{ width: "80px" }}
              />
              <h3>USMANMSS</h3>
              <p>UsmanMss</p>
            </div>
            <div className="icon">
              <i className="fas fa-whatsapp"></i>
            </div>
            <div className="small-box-footer">
              More info <i className="fas fa-arrow-circle-right"></i>
            </div>
          </Link>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
          <Link to="/whatsapp-gateway" className="small-box bg-warning">
            <div className="inner text-center">
              <img
                src="./images/icons8-whatsapp.gif" /* Pastikan path benar */
                alt="WhatsApp Gateway Logo"
                className="mb-3"
                style={{ width: "80px" }}
              />
              <h3>WhatsApp Gateway</h3>
              <p>Manage WhatsApp Gateway</p>
            </div>
            <div className="icon">
              <i className="fas fa-exchange-alt"></i>
            </div>
            <div className="small-box-footer">
              More info <i className="fas fa-arrow-circle-right"></i>
            </div>
          </Link>
        </div>
      </div>

      {/* Informasi Tambahan */}
      <div className="row">
        <div className="col-12 text-center">
          {/* <h1>Selamat datang di WhatsApp Center &amp; Gateway Dashboard</h1> */}
          <h1>Welcome To WMS - WhatsApp Management System </h1>
          <p>.:Whatsapp Center &amp; Whatsapp Gateway Microservices:..</p>
        </div>
      </div>
    </div>
  );
}
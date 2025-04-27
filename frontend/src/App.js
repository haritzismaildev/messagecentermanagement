import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// import SendMessage from './components/SendMessage';
import SendTwilioMessage from './components/SendTwilioMessage';

import Login from "./pages/Login";
import Home from "./pages/Home";
import VerifyOTP from './pages/VerifyOTP';
import SendMessage from './pages/SendMessage';
import BulkMessaging from './pages/BulkMessaging';

import Chat from './pages/Chat';  // Halaman komunikasi dua arah

// import SendWhatsApp from "./pages/SendWhatsApp";
// import UserManagement from "./pages/UserManagement"; // jika sudah ada

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
        </Route>

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Home />} />
          {/* <Route path="/send-message" element={<SendMessage />} /> */}
          <Route path="/send-message" element={<SendMessage />} />
          <Route path="/bulk-messaging" element={<BulkMessaging />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/send-twilio-message" element={<SendTwilioMessage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
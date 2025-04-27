import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from '../components/Sidebar';
import './DashboardLayout.css';
import useIdleTimer from '../hooks/useIdleTimer';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);  // state untuk toggle sidebar

  // Idle timeout 5 menit (300000 ms)
  useIdleTimer(300000, () => {
    // Otomatis logout ketika idle selama 5 menit
    localStorage.clear();
    navigate("/login");
    alert("Anda telah idle selama 5 menit. Anda telah logout secara otomatis.");
  });

  const handleLogout = () => {
    // Hapus data di localStorage
    localStorage.clear();
  
    // Jika menggunakan sessionStorage:
    sessionStorage.clear();
  
    // Jika menggunakan cookies (gunakan library seperti js-cookie)
    // Cookies.remove('token');
  
    // Opsional: jika ada cache tertentu, hapus cache itu
    if (window.caches) {
      caches.keys().then((names) => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Arahkan ke halaman login
    navigate("/login");
  };

const toggleSidebar = () => {
  setSidebarOpen((prev) => !prev);
};

  return (
    // <div className="dashboard-container">
    //   {/* NAVBAR (TOP) */}
    //   <header className="navbar-top">
    //       <button className="toggle-btn" onClick={toggleSidebar}>
    //         <i className="fas fa-bars"></i> {/* atau icon hamburger lain */}
    //       </button>
    //       <div className="navbar-right">
    //         {/* Foto profil (contoh) */}
    //         <img
    //           src="https://i.pravatar.cc/40" 
    //           alt="User Profile"
    //           className="profile-pic"
    //         />
    //         {/* Tombol Logout */}
    //         <button onClick={handleLogout} className="logout-btn">
    //           Logout
    //         </button>
    //       </div>
    //     </header>

    //     {/* SIDEBAR */}
    //     {sidebarOpen && <Sidebar />}

    //     {/* KONTEN */}
    //     <div className={`dashboard-content ${sidebarOpen ? "with-sidebar" : "no-sidebar"}`}>
    //       <Outlet />
    //     </div>
    // </div>

    <div className="dashboard-layout">
      {/* NAVBAR di atas */}
      <header className="topbar">
        <button onClick={toggleSidebar} className="toggle-btn">☰</button>
        <div className="navbar-right">
          {/* Contoh foto profil & logout */}
          <img src="https://i.pravatar.cc/40" alt="Profile" />
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Bagian bawah: sidebar + konten */}
      <div className="main-body">
        {sidebarOpen && <Sidebar />}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>

  );
}
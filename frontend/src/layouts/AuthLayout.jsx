import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: "1000vh",
        display: "flex",
        flexDirection: "column",
        // Opsi styling lain (centered, dsb.)
      }}
    >
      {/* Di sini bisa taruh brand kecil, background, dsb. */}
      <Outlet />
    </div>
  );
}
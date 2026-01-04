"use client";
import { useState } from "react";

export default function AdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#5A3EFB]">Admin Login</h1>
        <input
          type="password"
          className="w-full p-3 border rounded mb-4 focus:ring-2 focus:ring-[#5A3EFB]"
          placeholder="Enter Admin Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full p-3 bg-[#5A3EFB] hover:bg-[#4a33d6] text-white rounded-xl transition-all">
          Login
        </button>
      </div>
    </div>
  );
};
  



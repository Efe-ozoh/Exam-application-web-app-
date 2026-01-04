
"use client"
import { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import Sidedrawer from "./Sidedrawer"


export default function Sidebar() {
  const [open, setOpen] = useState(false);

  // Scroll hide/show logic
  if (typeof window !== 'undefined') {
    let scrollTimeout;
    window.onscroll = () => {
      const bar = document.getElementById('topBar');
      bar.style.opacity = '0';
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        bar.style.opacity = '1';
      }, 200);
    };
  }

  return (
    <div className="relative">
      {/* Toggle Button */}
      <div className="fixed top-0 right-0 w-full flex justify-between items-center p-3 bg-blue-700 shadow z-40 transition-opacity duration-300" id="topBar">
        <span className="text-2xl font-bold text-white">NaijaPrep</span>
        <button
        onClick={() => setOpen(!open)}
        className="p-3 m-3 text-blue-700 bg-white rounded-xl shadow-lg z-50 flex items-center justify-center"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        ></div>
      )}

      {/* Sidedrawer */}
      <Sidedrawer open={open} />
     
    </div>
  );
}

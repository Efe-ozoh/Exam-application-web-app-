
"use client"
import { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Image from "next/image"

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
    <div className="relative z-50">

      <div className="w-full flex items-center p-3 z-40 transition-opacity duration-300" id="topBar">

        <div className="flex mx-5">
       <Image   
        src="/assets/eduliver-logo.png"
        alt="Eduliver logo_Free JAMB CBT"
        width={80}
        height={80}
        className="w-full h-auto"/>
     
      </div>

      {/* Toggle Button */}
      <div className="justify-endw-full flex fixed top-0 right-0">
        <button
        onClick={() => setOpen(!open)}
        className="relative p-3 m-3 text-white m-5 bg-blue-700 rounded-xl shadow-lg z-50 flex items-center justify-center"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      </div>
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

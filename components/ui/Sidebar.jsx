
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

<div
  id="topBar"
  className="w-full flex items-center justify-between px-4 py-3 z-40 transition-opacity duration-300"
>
  <div className="flex items-center gap-3">
    <Image
      src="/assets/eduliver-logo.png"
      alt="Eduliver logo_Free JAMB CBT"
      width={70}
      height={70}
      className="h-17 w-auto"
      priority
    />
  </div>

  <button
    onClick={() => setOpen(!open)}
    className="p-3 text-white bg-blue-700 rounded-xl shadow-lg z-50 flex items-center justify-center h-12 w-12"
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

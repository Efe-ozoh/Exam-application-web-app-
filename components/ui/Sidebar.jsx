"use client";
import { useState, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import Sidedrawer from "./Sidedrawer";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      const bar = document.getElementById("topBar");
      if (!bar) return;

      bar.style.opacity = "0";
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        bar.style.opacity = "1";
      }, 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
  id="topBar"
  className="w-full flex items-center justify-between px-4 py-3 z-40 transition-opacity duration-300"
>
  <div className="flex items-center gap-3">
    <Image
      src="/assets/eduliver-logo.png"
      alt="Eduliver logo_Free JAMB CBT"
      width={65}
      height={65}
      className="h-14 w-auto"
      priority
    />
  </div>

  <div className="justify-end w-full flex fixed top-0 right-0">
        <button
        onClick={() => setOpen(!open)}
        className="relative p-3 m-3 text-white m-5 bg-blue-700 rounded-xl shadow-lg z-50 flex items-center justify-center"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      </div>



      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* Sidedrawer */}
      <Sidedrawer open={open} />
    </div>
  );
}

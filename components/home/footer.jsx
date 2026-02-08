import React from 'react';
import { EmailOutlined, Instagram, X } from "@mui/icons-material";

const Footer = () => {
  return (
    <footer className="bg-blue-700 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 text-white">
        
        {/* Contact */}
        <div>
          <h4 className="text-lg font-bold mb-4">Contact Us</h4>
          <div className="flex flex-col gap-3">
            <a href="https://x.com/Ozoh17" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
              <X /> X
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
              <Instagram /> Instagram
            </a>
            <a href="mailto:eduliver1@gmail.com" className="flex items-center gap-2 hover:underline">
              <EmailOutlined /> Email
            </a>
          </div>
        </div>

        {/* About */}
        <div>
          <h4 className="text-lg font-bold mb-4">About Us</h4>
          <div className="flex flex-col gap-3">
            <a href="/policy" className="hover:underline font-bold">Policy</a>
            <a href="/terms" className="hover:underline font-bold">Terms of Service</a>
          </div>
        </div>
      </div>

      <hr className="border-white mx-10" />

      <p className="text-center text-white py-4 text-sm">
        ©{new Date().getFullYear()} Eduliver. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer;

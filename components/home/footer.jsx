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
          <a href="#" className="flex items-center gap-2 hover:underline">
            <X /> Twitter
          </a>
          <a href="#" className="flex items-center gap-2 hover:underline">
            <Instagram /> Instagram
          </a>
          <a href="#" className="flex items-center gap-2 hover:underline">
            <EmailOutlined /> Email
          </a>
        </div>
      </div>

      {/* About */}
      <div>
        <h4 className="text-lg font-bold mb-4">About Us</h4>
        <div className="flex flex-col gap-3">
          <a href="#" className="hover:underline font-bold">Policy</a>
          <a href="#" className="hover:underline font-bold">Terms of Service</a>
          <a href="#" className="hover:underline font-bold">FAQ</a>
        </div>
      </div>
    </div>

    <hr className="border-white mx-10" />

    <p className="text-center text-white py-4 text-sm">
      ©{new Date().getFullYear()} NaijaPrep. All rights reserved.
    </p>
  </footer>
  )
}

export default Footer;

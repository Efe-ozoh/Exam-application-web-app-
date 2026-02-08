import React from 'react';

import HomeIcon from '@mui/icons-material/Home';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ArticleIcon from '@mui/icons-material/Article';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import Link from "next/link";

const Sidedrawer = ({open}) => {
  return (
    <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
       <div className="p-6 border-b bg-blue-700 text-white font-bold text-2xl">
          Eduliver
        </div>

        <nav className="p-4 flex flex-col space-y-4 text-blue-700 font-medium">
          <Link href="/" className="flex items-center font-bold gap-3 p-3 rounded-xl hover:bg-[#E8E6FF] transition">
            <HomeIcon />  Home
          </Link>
          <Link href="/exams" className="flex items-center font-bold gap-3 p-3 rounded-xl hover:bg-[#E8E6FF] transition">
            <MenuBookOutlinedIcon />  Practice
          </Link>
          <Link href="/news" className="flex items-center font-bold gap-3 p-3 rounded-xl hover:bg-[#E8E6FF] transition">
            <ArticleIcon />  Education News
          </Link>
          <Link href="/past_questions" className="flex items-center font-bold gap-3 p-3 rounded-xl hover:bg-[#E8E6FF] transition">
            <InfoOutlineIcon />  Past Questions
          </Link>
        </nav>
    </div>
  )
}

export default Sidedrawer;

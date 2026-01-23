import CardSlider from '@/components/home/cardSlider';
import { EmailOutlined, Instagram, X } from "@mui/icons-material";
import Link from 'next/link';
import Image from 'next/image';

export default async function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="flex flex-col-reverse lg:flex-row items-center gap-10 px-4 sm:px-8 lg:px-16 py-20 max-w-7xl mx-auto">
        
        {/* Text */}
        <div className="text-center lg:text-left max-w-xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700">
            Ready to boost your exam performance?
          </h1>

          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700 mt-2">
            We've got you covered for free.
          </h3>

          <Link href="/exam_option">
            <button
              className="mt-6 px-8 py-3 sm:px-8 sm:py-4 bg-blue-700 hover:bg-blue-800 
              transition rounded-full text-white font-bold text-base sm:text-lg w-1/2 sm:w-auto"
            >
              Get Started
            </button>
          </Link>
        </div>

        {/* Image */}
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <Image
            src="/assets/studying.png"
            alt="Free JAMB CBT"
            width={450}
            height={450}
            className="w-full h-auto"
            priority
          />
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="px-4 sm:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-blue-700 text-lg sm:text-2xl font-bold mb-4">
            NaijaPrep makes your exam preparation fun and exciting!
          </h3>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-justify">
            Practice real UTME mock exams for free, test your skills, and see how ready you are for the main exam.
            Get instant feedback to help you improve fast. With NaijaPrep, studying feels less like stress and more like a game!
          </p>
        </div>
      </section>

      {/* CARD SLIDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <CardSlider />
      </section>

      {/* FOOTER */}
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

        <hr className="border-white mx-6" />

        <p className="text-center text-white py-4 text-sm">
          ©{new Date().getFullYear()} NaijaPrep. All rights reserved.
        </p>
      </footer>
    </>
  );
}

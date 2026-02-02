import React from 'react'
import Link from 'next/link';
import Image from 'next/image';



const HeadSection = () => {
  return (
    <section className="flex flex-col-reverse lg:flex-row items-center gap-10 px-4 sm:px-8 lg:px-16 py-20 max-w-7xl mx-auto">
        
    {/* Text */}
    <div className="text-center lg:text-left max-w-xl">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700">
        Ready to boost your exam performance?
      </h1>

      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700 mt-2">
        We've got you covered for free.
      </h3>

      <Link href="/exams">
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
  )
}

export default HeadSection;

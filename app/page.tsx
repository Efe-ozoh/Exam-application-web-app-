import CardSlider from '@/components/home/cardSlider';
import {EmailOutlined, Instagram, X} from "@mui/icons-material";
import Link from '@/node_modules/next/link';
import Image from 'next/image';


export default async function Home() {

  

  return (
    <>
    <section className="cto flex flex-col lg:flex-row p-6 items-center mb-15 w-full h-auto">
      <div className="mt-12 pt-20 px-6 lg:ml-3">
        <h1 className="lg:text-3xl text-2xl font-bold text-blue-700 ">Ready to boost your Exams performance?</h1>
        <h3 className="text-lg lg:text-2xl font-bold text-gray-700">We've got you covered for free.</h3>
       <button
  className="bg-blue-700 p-3 sm:p-4 my-2 border-2 border-gray-300 text-white font-bold text-base sm:text-lg rounded-full mt-4 w-3/5 sm:w-1/3 lg:w-1/4 hover:bg-blue-800 transition  duration-300  ease-in-out"
>
  <Link href="/exam_option">Get started</Link> 
</button>

        </div>

      <Image src="/assets/studying.png" alt="free JAMB cbt" width={400} height={450} className=" mt-12 pt-20 lg:ml-20 ml-0 max-w-full h-auto"/>
    </section>

 <section className="content">
      <div className="max-w-3xl mx-auto text-center mb-4 mt-10 py-20">
        <h3 className="text-blue-700 text-lg mx-3 lg:text-2xl font-bold pb-4">NaijaPrep makes your exam preparation fun and exciting!</h3>
        <p className="text-gray-600 mb-6 lg:text-lg text-justify mx-6">Practice real UTME mock exams for free, test your skills, and see how ready you are for the main exam.
          Get instant feedback to help you improve fast. With NaijaPrep, studying feels less like stress and more like a game!</p>
      </div>
    </section>


                 {/* card slider */}
    <section className="slider mx-auto">
      <CardSlider />
    </section>

   

  <section className="footer bg-blue-700 mb-6 mt-15 w-auto">

   <div className="block lg:flex lg:items-start lg:justify-center pt-6 pb-6">
        
    
      <div className="text-white text-start lg:text-center justify-center lg:ml-7 mt-6  mx-6">
        <h4 className='text-white text-lg font-bold pt-3'>Contact us</h4>

        <div className="flex flex-col lg:flex-row lg:justify-evenly text-start lg:text-center pt-2 font-bold">
          
          <a href="#" className="hover:underline my-2 mx-3"><X />  Twitter</a>
          <a href="#" className="hover:underline my-2 mx-3"><Instagram />  Instagram</a>
          <a href="#" className="hover:underline my-2 mx-3"><EmailOutlined />  Email</a>
        </div>
    

      </div>

      <div className=" text-white justify-center lg:ml-7 mt-6 mx-8">
      <h4 className=" text-start lg:text-center font-bold pt-3">About Us</h4>

      <div className="flex flex-col lg:flex-row lg:justify-evenly text-start lg:text-center pt-2">
      <a href="#" className="text-lg font-bold my-2 mx-3 hover:underline">Policy</a>
      <a href="#" className="text-lg font-bold my-2 mx-3 hover:underline">Terms of Service</a>
      <a href="#" className="text-lg font-bold my-2 mx-3 hover:underline">FAQ</a>
      </div>
      {/* <p className="text-white text-justify px-4">NaijaPrep is dedicated to helping students excel in their exams through engaging and effective practice tests. <br /> Our mission is to make exam preparation accessible and enjoyable for everyone.</p> */}
      </div>
    </div>

      <hr className='border-gray-600 my-6 mx-6' />
      <p className="text-white text-center my-4 ">©{new Date().getFullYear()} NaijaPrep. All rights reserved.</p>
    </section>
    </>
  );
}

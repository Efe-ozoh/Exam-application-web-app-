import React from 'react'

import CardSlider from './cardSlider';
import Services from "./services";

const BodySection = () => {
  return (
      <>
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

      <div className="max-w-3xl mx-auto text-center my-10 px-4 sm:px-8">
          <h3 className="text-blue-700 text-lg sm:text-2xl font-bold mb-4 pt-10">
            Best Assistance you can Get!
          </h3>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-justify">
            We offer the best assistance you can get in helping you stay updated, connected and accurate in acadamics
          </p>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <Services />
      </section>
      </>
  )
}

export default BodySection;

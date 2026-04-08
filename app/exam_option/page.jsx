import React from 'react';
import ExamOptions from "./client/ExamOption"

export const metadata = {
  title: "Exam Options",
  description: "Select your exam type, year and subjects",
};

const page = () => {
  return (
  <ExamOptions/>
  )
}

export default page;

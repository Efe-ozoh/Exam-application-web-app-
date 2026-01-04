import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Question from "@/lib/models/question.schema.jsx";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // Basic validation
    if (
      !exam ||
      !subject ||
      !question ||
      !options.A ||
      !options.B ||
      !options.C ||
      !options.D ||
      !correctAnswer
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newQuestion = await Question.create({
      exam,
      subject,
      year,
      question,
      options: {
        A: options.A,
        B: options.B,
        C: options.C,
        D: options.D,
      },
      answer: correctAnswer,
      imgUrl: imgUrl || null,
    });

    return NextResponse.json(
      { success: true, question: newQuestion },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};






export async function GET(req) {

  
    try {
      await connectDB();
    
      const { searchParams } = new URL(req.url);
    
      const examType = searchParams.get("examType");
      const yearParam = searchParams.get("year");
      const subjectsParam = searchParams.get("subjects");
    
      let subjects = [];
      if (subjectsParam) {
        try {
          subjects = JSON.parse(subjectsParam);
        } catch {
          subjects = [];
        }
      }
    
      const query = {};
    
      if (examType) query.exam = examType;
      if (yearParam) query.year = Number(yearParam);
      if (subjects.length > 0) query.subject = { $in: subjects };
    
      
      const questions = await Question.find(query);
    
      return NextResponse.json({ success: true, questions });
    
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
  }
    
  
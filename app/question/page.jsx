import { Suspense } from "react";
import QuestionClient from "./client/QuestionClient";
import QuestionPageSkeleton from "@/components/skeletons/question";



export default function Page() {
  return (
    <Suspense fallback={<QuestionPageSkeleton />}>
      <QuestionClient />
    </Suspense>
  );
}

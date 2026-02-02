"use client";

import * as React from "react";
import { Typography, Box, Stack } from "@mui/material";

import { examList } from "@/components/exams/ExamList";
import ExamCard from "@/components/exams/Card";



 const Exams = () => {
  return (
    <Box sx={{ backgroundColor: "#f7f7f7", minHeight: "100vh", p: 3 }}>
      <Typography className="text-blue-700" variant="h4" sx={{fontWeight: 700, mb: 1 }}>
        Jamb Subjects
      </Typography>
      <Box className="bg-blue-700"  sx={{ height: 2, mb: 3 }} />

      <Stack spacing={3}>
        {examList.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </Stack>
    </Box>
  );
};

export default Exams;

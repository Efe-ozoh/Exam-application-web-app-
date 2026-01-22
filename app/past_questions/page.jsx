"use client";

import * as React from "react";
import { Card, CardContent, CardMedia, Button, Typography, Box, Stack } from "@mui/material";


const subjects = [
  {
    id: 1,
    title: "Accounts - Principles of Accounts",
    image: "/images/accounts.jpg",
  },
  {
    id: 2,
    title: "Agricultural Science",
    image: "/images/agric.jpg",
  },
  {
    id: 3,
    title: "Arabic",
    image: "/images/arabic.jpg",
  },
];

export default function JambSubjectsPage() {
  return (
    <Box sx={{ backgroundColor: "#f7f7f7", minHeight: "100vh", p: 3 }}>
      <Typography variant="h4" sx={{ color: "#a00000", fontWeight: 700, mb: 1 }}>
        Jamb Subjects
      </Typography>
      <Box sx={{ height: 2, backgroundColor: "#a00000", mb: 3 }} />

      <Stack spacing={3}>
        {subjects.map((subject) => (
          <Card
            key={subject.id}
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              p: 2,
              borderRadius: 3,
              boxShadow: 2,
            }}

            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <CardMedia
              component="img"
              sx={{
                width: { xs: "100%", sm: 90 },
                height: { xs: 160, sm: 90 },
                borderRadius: 2,
                mb: { xs: 2, sm: 0 },
                mr: { xs: 0, sm: 2 },
              }}

              component="img"
              image={subject.image}
              alt={subject.title}
              sx={{ width: 90, height: 90, borderRadius: 2, mr: 2 }}
            />

            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                {subject.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

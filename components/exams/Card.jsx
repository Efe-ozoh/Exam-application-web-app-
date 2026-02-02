import React from 'react';

import { Card, CardContent, CardMedia, Typography} from "@mui/material";
import Link from "next/link";

const ExamCard = ({ exam }) => {
  return (
      <Link href={exam.url} key={exam.id} >
          <Card
            key={exam.id}
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              p: 2,
              borderRadius: 3,
              boxShadow: 2,
            }}

            sx={{ display: "flex", alignItems: "center", p: 2, borderRadius: 3, boxShadow: 2, }}
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
              image={exam.image}
              alt={exam.title}
              sx={{ width: 90, height: 90, borderRadius: 2, mr: 2 }}
            />

            <CardContent sx={{ flex: 1 }}>
              <Typography className="text-blue-700" variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {exam.title}
              </Typography>
            </CardContent>
          </Card>
          </Link>
  )};

export default ExamCard;

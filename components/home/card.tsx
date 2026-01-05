import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import Link from "next/link";

type Props = {
  title: string;
  description: string;
  image: string;
};

export default function ExamCard({ title, description, image }: Props) {
  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 280,
        mx: "auto",
        mt: 3,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Link href="/exam_option" passHref legacyBehavior>
        <CardActionArea>
          <CardMedia
            component="img"
            image={image}
            alt={title}
            sx={{
              width: "100%",
              height: 150,
              objectFit: "cover",
            }}
          />
          <CardContent>
            <Typography
              gutterBottom
              variant="h6"
              component="div"
              align="center"
              fontWeight="bold"
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              fontSize={14}
              color="text.secondary"
              align="center"
            >
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}

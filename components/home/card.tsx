import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Link from '@/node_modules/next/link';

type Props = {
  title: string;
  description: string;
  image: string;
};

export default function ExamCard({ title, description, image }: Props) {
  return (
    
  <Card sx={{ maxWidth: 240, width: '100%', mx: 'auto', my: '15px', }}>
    <Link href="/exam_option">
      <CardActionArea>
        <CardMedia
          component="img"
          image={image}
          alt={title}
          sx={{ width: 100, height: 100, objectFit: 'cover', display: 'block', margin: '0 auto' }}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" align="center">
            {title}
          </Typography>
          <Typography variant="body2" fontSize={16} color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      </Link>
    </Card>
   
  );
}
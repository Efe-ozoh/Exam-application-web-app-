import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Link from '@/node_modules/next/link';


export default function ExamCard({ title, description, image}) {
  return (
    
  <Card sx={{ maxWidth: 290, width: '100%', mx: 'auto', my: '15px', }}>
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



export function ServiceCard({ title, description, image, url }) {
  return (
    <Card
      sx={{
        mx: 'auto',
        my: 2,
        width: {
          xs: '90%', // mobile
          sm: 250,  // tablet
          md: 280,  // desktop
        },
        height: 'auto',
      }}
    >
      <Link href={url ? url : "/"} >
      <CardActionArea>
        <CardMedia
          component="img"
          image={image}
          alt={title}
          sx={{
            width: '100%',
            height: {
              xs: 160,  // mobile
              sm: 180,  // tablet
              md: 200,  // desktop
            },
            objectFit: 'cover', // this makes the image cover the area
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
          }}
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            align="center"
            sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ fontSize: { xs: 12, sm: 14, md: 16 } }}
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      
      </Link>
    </Card>
  );
}

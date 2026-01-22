import React from "react";
import { Card, CardContent, CardMedia, Typography} from "@mui/material";


const Card = ({img, title, id}) => {

    return (
        <Card
        key={id}
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
          image={img}
          alt={title}
          sx={{ width: 90, height: 90, borderRadius: 2, mr: 2 }}
        />

        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    )
}
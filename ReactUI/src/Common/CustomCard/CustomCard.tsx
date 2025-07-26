import React from 'react';
import { Card, CardContent, CardActions, Typography, Button } from '@mui/material';

interface cardProperties{
    title: string,
    content: React.ReactNode,
    actionLabel: string,
    onAction: () => void
}

const CustomCard = ({ title, content, actionLabel, onAction }:cardProperties) => (
  <Card sx={{ maxWidth: 345, m: 2 }}>
    <CardContent>
      <Typography gutterBottom variant="h5" component="div">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {content}
      </Typography>
    </CardContent>
    {actionLabel && (
      <CardActions>
        <Button size="small" onClick={onAction}>{actionLabel}</Button>
      </CardActions>
    )}
  </Card>
);

export default CustomCard;
import React from 'react'
import { Card, CardContent, Skeleton, Box } from '@mui/material'

export default function SkeletonCard() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={24} width="75%" sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} width="50%" />
      </CardContent>
    </Card>
  )
}

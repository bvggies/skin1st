import React, { useState } from 'react'
import { Box, ImageList, ImageListItem, Paper } from '@mui/material'

export default function ImageGallery({ images }: { images: { url: string; alt?: string }[] }) {
  const [idx, setIdx] = useState(0)
  const active = images && images.length ? images[idx] : { url: 'https://placehold.co/600x400', alt: '' }

  return (
    <Box>
      <Paper sx={{ mb: 2, overflow: 'hidden' }}>
        <Box
          component="img"
          src={active.url}
          alt={active.alt}
          sx={{ width: '100%', display: 'block' }}
        />
      </Paper>
      {images && images.length > 1 && (
        <ImageList cols={images.length} gap={8} sx={{ m: 0 }}>
          {images.map((img, i) => (
            <ImageListItem
              key={i}
              onClick={() => setIdx(i)}
              sx={{
                cursor: 'pointer',
                border: i === idx ? 2 : 1,
                borderColor: i === idx ? 'primary.main' : 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <Box
                component="img"
                src={img.url}
                alt={img.alt}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  )
}

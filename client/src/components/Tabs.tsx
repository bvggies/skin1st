import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Tabs as MuiTabs, Tab, Paper, Box } from '@mui/material'

export default function Tabs({
  tabs,
  active = 0,
}: {
  tabs: { id: string; title: string; content: React.ReactNode }[]
  active?: number
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [i, setI] = React.useState(active)

  React.useEffect(() => {
    const hash = location.hash?.replace('#', '')
    if (hash) {
      const idx = tabs.findIndex((t) => t.id === hash)
      if (idx !== -1) setI(idx)
    }
  }, [location.hash, tabs])

  const handleSelect = (idx: number) => {
    setI(idx)
    const id = tabs[idx]?.id
    if (id) {
      navigate(`#${id}`, { replace: false })
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  return (
    <Box>
      <MuiTabs 
        value={i} 
        onChange={(_, value) => handleSelect(value)} 
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ 
          mb: 2,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTabs-scrollButtons': {
            '&.Mui-disabled': { opacity: 0.3 },
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            minWidth: { xs: 'auto', sm: 120 },
            px: { xs: 2, sm: 3 },
          },
        }}
      >
        {tabs.map((t) => (
          <Tab key={t.id} label={t.title} id={`tab-${t.id}`} />
        ))}
      </MuiTabs>
      <Paper id={tabs[i]?.id} sx={{ p: { xs: 2, sm: 3 } }}>
        {tabs[i]?.content}
      </Paper>
    </Box>
  )
}

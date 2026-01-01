import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Tabs({ tabs, active = 0 }: { tabs: { id: string; title: string; content: React.ReactNode }[]; active?: number }){
  const location = useLocation()
  const navigate = useNavigate()
  const [i, setI] = React.useState(active)

  // initialize from hash if present
  React.useEffect(()=>{
    const hash = location.hash?.replace('#','')
    if (hash) {
      const idx = tabs.findIndex(t=>t.id === hash)
      if (idx !== -1) setI(idx)
    }
  }, [location.hash, tabs])

  const handleSelect = (idx: number) => {
    setI(idx)
    const id = tabs[idx]?.id
    if (id) {
      // update hash without reloading
      navigate(`#${id}`, { replace: false })
      // also ensure the element is scrolled into view if exists
      setTimeout(()=>{
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {tabs.map((t, idx)=> (
          <button id={`tab-${t.id}`} key={t.id} onClick={()=>handleSelect(idx)} className={`px-3 py-1 rounded ${idx===i ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{t.title}</button>
        ))}
      </div>
      <div id={tabs[i]?.id} className="bg-white dark:bg-gray-800 rounded p-4 shadow-sm">{tabs[i]?.content}</div>
    </div>
  )
}

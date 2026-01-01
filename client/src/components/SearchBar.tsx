import React, { useEffect, useState } from 'react'
import SearchAutocomplete from './SearchAutocomplete'

export default function SearchBar({ value: initial = '', onChange }: { value?: string; onChange: (v: string) => void }){
  const [value, setValue] = useState(initial)

  useEffect(()=>{
    const t = setTimeout(()=> onChange(value), 400)
    return ()=>clearTimeout(t)
  }, [value, onChange])

  return (
    <div className="relative">
      <input 
        value={value} 
        onChange={(e)=>setValue(e.target.value)} 
        placeholder="Search products..." 
        className="w-full border p-2 rounded" 
      />
    </div>
  )
}

export { SearchAutocomplete }

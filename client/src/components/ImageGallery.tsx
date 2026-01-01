import React, { useState } from 'react'

export default function ImageGallery({ images }: { images: { url: string; alt?: string }[] }){
  const [idx, setIdx] = useState(0)
  const active = images && images.length ? images[idx] : { url: 'https://placehold.co/600x400', alt: '' }
  return (
    <div>
      <div className="mb-3">
        <img src={active.url} alt={active.alt} className="w-full rounded shadow" />
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {images?.map((img,i)=> (
          <button key={i} onClick={()=>setIdx(i)} className={`w-20 h-14 rounded overflow-hidden border ${i===idx? 'ring-2 ring-indigo-500':''}`}>
            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

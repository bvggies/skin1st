import React from 'react'

export default function SkeletonCard(){
  return (
    <div className="animate-pulse bg-white rounded shadow p-3">
      <div className="bg-gray-200 h-40 rounded w-full mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

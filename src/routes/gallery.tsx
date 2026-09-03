import { createFileRoute } from '@tanstack/react-router'
import React from 'react'

export const Route = createFileRoute('/gallery')({
  component: GalleryRoute,
})

function GalleryRoute() {
  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Gallery</h1>
      <p className="text-slate-600 mb-8">View our premium services and exclusive fleet.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for gallery items */}
        <div className="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-slate-400">Image 1</div>
        <div className="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-slate-400">Image 2</div>
        <div className="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-slate-400">Image 3</div>
        <div className="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-slate-400">Image 4</div>
        <div className="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-slate-400">Image 5</div>
        <div className="bg-slate-100 h-64 rounded-xl flex items-center justify-center text-slate-400">Image 6</div>
      </div>
    </div>
  )
}

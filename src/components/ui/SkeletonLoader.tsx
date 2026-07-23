import React from "react";
import { Skeleton } from "./skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-4">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-64 bg-white/5" />
        <Skeleton className="h-4 w-96 bg-white/5" />
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="h-32 border border-white/5 bg-[#090d16]/20 p-6 space-y-4">
          <Skeleton className="h-4 w-24 bg-white/5" />
          <Skeleton className="h-8 w-16 bg-white/5" />
        </div>
        <div className="h-32 border border-white/5 bg-[#090d16]/20 p-6 space-y-4">
          <Skeleton className="h-4 w-24 bg-white/5" />
          <Skeleton className="h-8 w-16 bg-white/5" />
        </div>
        <div className="h-32 border border-white/5 bg-[#090d16]/20 p-6 space-y-4">
          <Skeleton className="h-4 w-24 bg-white/5" />
          <Skeleton className="h-8 w-16 bg-white/5" />
        </div>
      </div>

      {/* Two Columns Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <div className="border border-white/5 bg-[#090d16]/10 p-6 space-y-4">
            <Skeleton className="h-6 w-full bg-white/5" />
            <Skeleton className="h-16 w-full bg-white/5" />
            <Skeleton className="h-16 w-full bg-white/5" />
            <Skeleton className="h-16 w-full bg-white/5" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <div className="border border-white/5 bg-[#090d16]/10 p-6 space-y-4">
            <Skeleton className="h-12 w-full bg-white/5" />
            <Skeleton className="h-12 w-full bg-white/5" />
            <Skeleton className="h-12 w-full bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48 bg-white/5" />
        <Skeleton className="h-9 w-32 bg-white/5" />
      </div>
      <div className="border border-white/5 bg-[#090d16]/10">
        <div className="border-b border-white/5 p-4 flex gap-4">
          <Skeleton className="h-4 w-1/4 bg-white/5" />
          <Skeleton className="h-4 w-1/4 bg-white/5" />
          <Skeleton className="h-4 w-1/4 bg-white/5" />
          <Skeleton className="h-4 w-1/4 bg-white/5" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-full bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BookingEngineSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 md:p-12 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3 text-center">
          <Skeleton className="h-10 w-64 mx-auto bg-black/5" />
          <Skeleton className="h-4 w-96 mx-auto bg-black/5" />
        </div>
        <div className="border border-black/5 bg-white/50 p-8 rounded-3xl space-y-6">
          <Skeleton className="h-12 w-full bg-black/5" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-12 w-full bg-black/5" />
            <Skeleton className="h-12 w-full bg-black/5" />
          </div>
          <Skeleton className="h-32 w-full bg-black/5" />
          <Skeleton className="h-14 w-full bg-black/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

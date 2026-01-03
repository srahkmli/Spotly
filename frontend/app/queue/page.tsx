'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/store'
import QueueList from '@/components/QueueList'
import Navigation from '@/components/Navigation'

export default function QueuePage() {
  const { queue, loading, fetchQueue } = useStore()

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Parking Queue</h1>
          <p className="text-gray-600 mt-1">Drag and drop to reorder the queue</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <QueueList queue={queue} />
        )}
      </main>
    </div>
  )
}


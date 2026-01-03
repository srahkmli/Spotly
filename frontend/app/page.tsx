'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/store'
import Dashboard from '@/components/Dashboard'
import Navigation from '@/components/Navigation'

export default function Home() {
  const { fetchUsers, fetchTodayParking, fetchParkingSpaces } = useStore()

  useEffect(() => {
    fetchUsers()
    fetchTodayParking()
    fetchParkingSpaces()
  }, [fetchUsers, fetchTodayParking, fetchParkingSpaces])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Dashboard />
      </main>
    </div>
  )
}


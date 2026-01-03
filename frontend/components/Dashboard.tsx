'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useStore } from '@/store/store'
import ParkingSpaceCard from './ParkingSpaceCard'
import { ParkingIcon, UsersIcon, CalendarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const {
    assignments,
    users,
    parkingSpaces,
    loading,
    fetchTodayParking,
    fetchUsers,
    fetchParkingSpaces,
    recalculateParking,
  } = useStore()

  const [today] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    fetchTodayParking()
    fetchUsers()
    fetchParkingSpaces()
  }, [fetchTodayParking, fetchUsers, fetchParkingSpaces])

  const handleRecalculate = async () => {
    try {
      await recalculateParking(today, false, true)
      toast.success('Parking recalculated successfully')
      fetchTodayParking()
    } catch (error: any) {
      toast.error(error.message || 'Failed to recalculate parking')
    }
  }

  const handleSendSMS = async () => {
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today }),
      })
      if (response.ok) {
        toast.success('SMS sent successfully')
      } else {
        throw new Error('Failed to send SMS')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send SMS')
    }
  }

  // Create a map of assignments by parking space
  const assignmentsBySpace = new Map()
  assignments.forEach((ass) => {
    assignmentsBySpace.set(ass.parking_space_id, ass)
  })

  const totalSpaces = parkingSpaces.length
  const assignedSpaces = assignments.length
  const presentUsers = users.length // Simplified - should filter by attendance

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Today's Parking</h1>
          <p className="text-gray-600 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRecalculate}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Recalculate
          </button>
          <button
            onClick={handleSendSMS}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send SMS
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ParkingIcon className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Parking Spaces</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignedSpaces} / {totalSpaces}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Date</p>
              <p className="text-2xl font-bold text-gray-900">{format(new Date(), 'MMM d')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parking Spaces Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parkingSpaces.map((space) => {
            const assignment = assignmentsBySpace.get(space.id)
            return (
              <ParkingSpaceCard
                key={space.id}
                space={space}
                assignment={assignment}
              />
            )
          })}
          {parkingSpaces.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No parking spaces configured. Add parking spaces to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )
}


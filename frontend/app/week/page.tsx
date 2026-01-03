'use client'

import { useEffect, useState } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { useStore } from '@/store/store'
import Navigation from '@/components/Navigation'
import type { ParkingAssignment } from '@/types'

export default function WeekPage() {
  const [weekParking, setWeekParking] = useState<Record<string, ParkingAssignment[]>>({})
  const [loading, setLoading] = useState(true)
  const { parkingSpaces, fetchParkingSpaces } = useStore()

  useEffect(() => {
    fetchParkingSpaces()
    fetchWeekParking()
  }, [fetchParkingSpaces])

  const fetchWeekParking = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/parking/week')
      const data = await response.json()
      setWeekParking(data)
    } catch (error) {
      console.error('Failed to fetch week parking:', error)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()
  const monday = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(monday, i))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Weekly Schedule</h1>
          <p className="text-gray-600 mt-1">
            {format(monday, 'MMM d')} - {format(addDays(monday, 4), 'MMM d, yyyy')}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Space
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.toISOString()}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {format(day, 'EEE M/d')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parkingSpaces.map((space) => {
                  return (
                    <tr key={space.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {space.label}
                      </td>
                      {weekDays.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const assignments = weekParking[dateStr] || []
                        const assignment = assignments.find((a) => a.parking_space_id === space.id)
                        return (
                          <td key={dateStr} className="px-6 py-4">
                            {assignment?.user ? (
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">{assignment.user.name}</p>
                                <p className="text-gray-500 font-mono text-xs">{assignment.user.car_plate}</p>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}


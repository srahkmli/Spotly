'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useStore } from '@/store/store'
import AttendanceSwitch from '@/components/AttendanceSwitch'
import Navigation from '@/components/Navigation'

export default function AttendancePage() {
  const { users, attendance, loading, fetchUsers, fetchAttendance, markAttendance } = useStore()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (selectedDate) {
      fetchAttendance(selectedDate)
    }
  }, [selectedDate, fetchAttendance])

  const attendanceMap = new Map(attendance.map((att) => [att.user_id, att.is_present]))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car Plate
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const isPresent = attendanceMap.get(user.id) ?? true // Default to present
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {user.car_plate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <AttendanceSwitch
                          userId={user.id}
                          date={selectedDate}
                          isPresent={isPresent}
                          onToggle={(isPresent) => markAttendance(user.id, selectedDate, isPresent)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No users found. Add users to manage attendance.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}


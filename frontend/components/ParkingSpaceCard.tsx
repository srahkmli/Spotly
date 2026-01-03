'use client'

import type { ParkingSpace, ParkingAssignment } from '@/types'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface ParkingSpaceCardProps {
  space: ParkingSpace
  assignment?: ParkingAssignment
}

export default function ParkingSpaceCard({ space, assignment }: ParkingSpaceCardProps) {
  const isOccupied = !!assignment
  const user = assignment?.user

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-2 ${
        isOccupied ? 'border-green-500' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{space.label}</h3>
        {isOccupied ? (
          <CheckCircleIcon className="h-6 w-6 text-green-500" />
        ) : (
          <XCircleIcon className="h-6 w-6 text-gray-400" />
        )}
      </div>

      {isOccupied && user ? (
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Car Plate</p>
            <p className="text-lg font-mono text-gray-900">{user.car_plate}</p>
          </div>
          {assignment.is_auto_assigned && (
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              Auto-assigned
            </span>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500">Available</p>
        </div>
      )}
    </div>
  )
}


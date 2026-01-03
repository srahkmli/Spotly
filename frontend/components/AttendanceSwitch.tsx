'use client'

import { useState } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface AttendanceSwitchProps {
  userId: number
  date: string
  isPresent: boolean
  onToggle: (isPresent: boolean) => Promise<void>
}

export default function AttendanceSwitch({ isPresent, onToggle }: AttendanceSwitchProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await onToggle(!isPresent)
      toast.success(`Marked as ${!isPresent ? 'present' : 'absent'}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update attendance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        isPresent
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-red-100 text-red-800 hover:bg-red-200'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isPresent ? (
        <>
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Present
        </>
      ) : (
        <>
          <XCircleIcon className="h-5 w-5 mr-2" />
          Absent
        </>
      )}
    </button>
  )
}


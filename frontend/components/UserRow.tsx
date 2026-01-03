'use client'

import type { User } from '@/types'
import { useStore } from '@/store/store'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface UserRowProps {
  user: User
  onEdit: (user: User) => void
}

export default function UserRow({ user, onEdit }: UserRowProps) {
  const { deleteUser } = useStore()

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await deleteUser(user.id)
        toast.success('User deleted successfully')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete user')
      }
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {user.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
        {user.car_plate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.phone_number}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.priority}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onEdit(user)}
          className="text-primary-600 hover:text-primary-900 mr-4"
        >
          <PencilIcon className="h-5 w-5 inline" />
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-900"
        >
          <TrashIcon className="h-5 w-5 inline" />
        </button>
      </td>
    </tr>
  )
}


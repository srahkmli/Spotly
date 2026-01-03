'use client'

import { useState, useEffect } from 'react'
import type { ParkingQueue } from '@/types'
import { useStore } from '@/store/store'
import { Bars3Icon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface QueueListProps {
  queue: ParkingQueue[]
}

export default function QueueList({ queue }: QueueListProps) {
  const { reorderQueue } = useStore()
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [items, setItems] = useState(queue)

  // Update items when queue changes
  useEffect(() => {
    setItems(queue)
  }, [queue])

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)
    setItems(newItems)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    try {
      const userIds = items.map((item) => item.user_id)
      await reorderQueue(userIds)
      toast.success('Queue reordered successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to reorder queue')
    }

    setDraggedIndex(null)
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`p-4 flex items-center space-x-4 cursor-move hover:bg-gray-50 ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <Bars3Icon className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {item.user?.name || `User ${item.user_id}`}
                  </p>
                  <p className="text-sm text-gray-500 font-mono">{item.user?.car_plate}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    #{index + 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No users in queue. Add users to get started.
          </div>
        )}
      </div>
    </div>
  )
}


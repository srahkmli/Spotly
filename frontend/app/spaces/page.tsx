'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/store'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Navigation from '@/components/Navigation'

export default function SpacesPage() {
  const { parkingSpaces, loading, fetchParkingSpaces, createParkingSpace, deleteParkingSpace } = useStore()
  const [newSpaceLabel, setNewSpaceLabel] = useState('')

  useEffect(() => {
    fetchParkingSpaces()
  }, [fetchParkingSpaces])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSpaceLabel.trim()) {
      toast.error('Please enter a label')
      return
    }

    try {
      await createParkingSpace({ label: newSpaceLabel.trim() })
      setNewSpaceLabel('')
      toast.success('Parking space created successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create parking space')
    }
  }

  const handleDelete = async (id: number, label: string) => {
    if (confirm(`Are you sure you want to delete parking space ${label}?`)) {
      try {
        await deleteParkingSpace(id)
        toast.success('Parking space deleted successfully')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete parking space')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Parking Spaces</h1>
          <p className="text-gray-600 mt-1">Manage parking space configuration</p>
        </div>

        {/* Add Space Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleCreate} className="flex space-x-4">
            <input
              type="text"
              value={newSpaceLabel}
              onChange={(e) => setNewSpaceLabel(e.target.value)}
              placeholder="Enter space label (e.g., A1, A2, B1)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Space
            </button>
          </form>
        </div>

        {/* Spaces List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parkingSpaces.map((space) => (
              <div
                key={space.id}
                className="bg-white rounded-lg shadow p-6 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{space.label}</h3>
                  <p className="text-sm text-gray-500">Parking Space</p>
                </div>
                <button
                  onClick={() => handleDelete(space.id, space.label)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            {parkingSpaces.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No parking spaces configured. Add your first parking space above.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}


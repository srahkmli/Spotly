import { create } from 'zustand'
import type { User, ParkingAssignment, ParkingQueue, Attendance, ParkingSpace } from '@/types'
import { userAPI, parkingAPI, queueAPI, attendanceAPI, parkingSpaceAPI } from '@/lib/api'

interface Store {
  // State
  users: User[]
  assignments: ParkingAssignment[]
  queue: ParkingQueue[]
  attendance: Attendance[]
  parkingSpaces: ParkingSpace[]
  loading: boolean
  error: string | null

  // Actions
  fetchUsers: () => Promise<void>
  fetchTodayParking: () => Promise<void>
  fetchQueue: () => Promise<void>
  fetchAttendance: (date: string) => Promise<void>
  fetchParkingSpaces: () => Promise<void>
  recalculateParking: (date?: string, sendSMS?: boolean, rotateQueue?: boolean) => Promise<void>
  markAttendance: (user_id: number, date: string, is_present: boolean) => Promise<void>
  reorderQueue: (user_ids: number[]) => Promise<void>
  createUser: (user: Omit<User, 'id'>) => Promise<void>
  updateUser: (id: number, user: Partial<User>) => Promise<void>
  deleteUser: (id: number) => Promise<void>
  createParkingSpace: (space: Omit<ParkingSpace, 'id'>) => Promise<void>
  deleteParkingSpace: (id: number) => Promise<void>
  setError: (error: string | null) => void
}

export const useStore = create<Store>((set, get) => ({
  users: [],
  assignments: [],
  queue: [],
  attendance: [],
  parkingSpaces: [],
  loading: false,
  error: null,

  setError: (error) => set({ error }),

  fetchUsers: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await userAPI.getAll()
      set({ users: data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchTodayParking: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await parkingAPI.getToday()
      set({ assignments: data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchQueue: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await queueAPI.get()
      set({ queue: data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchAttendance: async (date: string) => {
    set({ loading: true, error: null })
    try {
      const { data } = await attendanceAPI.getByDate(date)
      set({ attendance: data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchParkingSpaces: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await parkingSpaceAPI.getAll()
      set({ parkingSpaces: data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  recalculateParking: async (date?: string, sendSMS?: boolean, rotateQueue?: boolean) => {
    set({ loading: true, error: null })
    try {
      const { data } = await parkingAPI.recalculate(date, sendSMS, rotateQueue)
      set({ assignments: data.assignments, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  markAttendance: async (user_id: number, date: string, is_present: boolean) => {
    set({ loading: true, error: null })
    try {
      await attendanceAPI.mark(user_id, date, is_present)
      await get().fetchAttendance(date)
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  reorderQueue: async (user_ids: number[]) => {
    set({ loading: true, error: null })
    try {
      await queueAPI.reorder(user_ids)
      await get().fetchQueue()
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createUser: async (user: Omit<User, 'id'>) => {
    set({ loading: true, error: null })
    try {
      await userAPI.create(user)
      await get().fetchUsers()
      await get().fetchQueue()
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  updateUser: async (id: number, user: Partial<User>) => {
    set({ loading: true, error: null })
    try {
      await userAPI.update(id, user)
      await get().fetchUsers()
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  deleteUser: async (id: number) => {
    set({ loading: true, error: null })
    try {
      await userAPI.delete(id)
      await get().fetchUsers()
      await get().fetchQueue()
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createParkingSpace: async (space: Omit<ParkingSpace, 'id'>) => {
    set({ loading: true, error: null })
    try {
      await parkingSpaceAPI.create(space)
      await get().fetchParkingSpaces()
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  deleteParkingSpace: async (id: number) => {
    set({ loading: true, error: null })
    try {
      await parkingSpaceAPI.delete(id)
      await get().fetchParkingSpaces()
      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },
}))


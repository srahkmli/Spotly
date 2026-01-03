import axios from 'axios'
import type { User, ParkingSpace, ParkingQueue, Attendance, ParkingAssignment } from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// User API
export const userAPI = {
  getAll: () => api.get<User[]>('/users'),
  get: (id: number) => api.get<User>(`/users/${id}`),
  create: (user: Omit<User, 'id'>) => api.post<User>('/users', user),
  update: (id: number, user: Partial<User>) => api.put<User>(`/users/${id}`, user),
  delete: (id: number) => api.delete(`/users/${id}`),
}

// Attendance API
export const attendanceAPI = {
  mark: (user_id: number, date: string, is_present: boolean) =>
    api.post<Attendance>('/attendance', { user_id, date, is_present }),
  getByDate: (date: string) => api.get<Attendance[]>(`/attendance/${date}`),
}

// Parking API
export const parkingAPI = {
  getToday: () => api.get<ParkingAssignment[]>('/parking/today'),
  getWeek: (date?: string) => api.get<Record<string, ParkingAssignment[]>>('/parking/week', { params: { date } }),
  recalculate: (date?: string, send_sms?: boolean, rotate_queue?: boolean) =>
    api.post<{ message: string; assignments: ParkingAssignment[] }>('/parking/recalculate', {
      date,
      send_sms,
      rotate_queue,
    }),
}

// Queue API
export const queueAPI = {
  get: () => api.get<ParkingQueue[]>('/queue'),
  reorder: (user_ids: number[]) => api.post('/queue/reorder', { user_ids }),
}

// Parking Space API
export const parkingSpaceAPI = {
  getAll: () => api.get<ParkingSpace[]>('/parking-spaces'),
  create: (space: Omit<ParkingSpace, 'id'>) => api.post<ParkingSpace>('/parking-spaces', space),
  delete: (id: number) => api.delete(`/parking-spaces/${id}`),
}

// SMS API
export const smsAPI = {
  send: (date?: string) => api.post('/sms/send', { date }),
}


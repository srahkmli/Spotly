export interface User {
  id: number
  name: string
  car_plate: string
  phone_number: string
  priority: number
}

export interface ParkingSpace {
  id: number
  label: string
}

export interface ParkingQueue {
  id: number
  user_id: number
  order_index: number
  user?: User
}

export interface Attendance {
  id: number
  user_id: number
  date: string
  is_present: boolean
  user?: User
}

export interface ParkingAssignment {
  id: number
  date: string
  parking_space_id: number
  user_id: number
  is_auto_assigned: boolean
  parking_space?: ParkingSpace
  user?: User
}


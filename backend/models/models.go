package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a person who can use parking
type User struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"not null" json:"name"`
	CarPlate    string `gorm:"not null" json:"car_plate"`
	PhoneNumber string `gorm:"not null" json:"phone_number"`
	Priority    int    `gorm:"default:0" json:"priority"` // Higher priority gets preference
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

// ParkingSpace represents a physical parking spot
type ParkingSpace struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Label     string `gorm:"uniqueIndex;not null" json:"label"` // A1, A2, A3, etc.
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

// ParkingQueue manages the queue order for parking assignment
type ParkingQueue struct {
	ID         uint `gorm:"primaryKey" json:"id"`
	UserID     uint `gorm:"uniqueIndex;not null" json:"user_id"`
	User       User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	OrderIndex int  `gorm:"not null;index" json:"order_index"` // Lower number = higher priority
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// Attendance tracks daily presence
type Attendance struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index:idx_user_date,unique" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Date      time.Time `gorm:"type:date;not null;index:idx_user_date,unique" json:"date"`
	IsPresent bool      `gorm:"not null;default:true" json:"is_present"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// ParkingAssignment represents daily parking assignments
type ParkingAssignment struct {
	ID             uint          `gorm:"primaryKey" json:"id"`
	Date           time.Time     `gorm:"type:date;not null;index:idx_date_space,unique" json:"date"`
	ParkingSpaceID uint          `gorm:"not null;index:idx_date_space,unique" json:"parking_space_id"`
	ParkingSpace   ParkingSpace  `gorm:"foreignKey:ParkingSpaceID" json:"parking_space,omitempty"`
	UserID         uint          `gorm:"not null" json:"user_id"`
	User           User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	IsAutoAssigned bool          `gorm:"default:true" json:"is_auto_assigned"` // true if auto-assigned, false if manual override
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}


package services

import (
	"fmt"
	"sort"
	"time"

	"Spotly/backend/models"

	"gorm.io/gorm"
)

type ParkingService struct {
	db *gorm.DB
}

func NewParkingService(db *gorm.DB) *ParkingService {
	return &ParkingService{db: db}
}

// CalculateDailyParking calculates parking assignments for a given date
func (s *ParkingService) CalculateDailyParking(date time.Time) error {
	// Normalize date to start of day
	date = time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())

	// Get all parking spaces
	var spaces []models.ParkingSpace
	if err := s.db.Find(&spaces).Error; err != nil {
		return fmt.Errorf("failed to get parking spaces: %w", err)
	}

	if len(spaces) == 0 {
		return fmt.Errorf("no parking spaces configured")
	}

	// Get all users in queue order
	var queue []models.ParkingQueue
	if err := s.db.Preload("User").Order("order_index ASC").Find(&queue).Error; err != nil {
		return fmt.Errorf("failed to get queue: %w", err)
	}

	if len(queue) == 0 {
		return fmt.Errorf("no users in queue")
	}

	// Get attendance for the date
	attendanceMap := make(map[uint]bool)
	var attendances []models.Attendance
	if err := s.db.Where("date = ?", date).Find(&attendances).Error; err != nil {
		return fmt.Errorf("failed to get attendance: %w", err)
	}

	for _, att := range attendances {
		attendanceMap[att.UserID] = att.IsPresent
	}

	// Filter present users, ordered by queue
	var presentUsers []models.ParkingQueue
	for _, q := range queue {
		// If no attendance record, assume present
		if isPresent, exists := attendanceMap[q.UserID]; !exists || isPresent {
			presentUsers = append(presentUsers, q)
		}
	}

	// Sort present users by priority (higher first), then by queue order
	// Users with same priority maintain queue order
	sortedUsers := make([]models.ParkingQueue, len(presentUsers))
	copy(sortedUsers, presentUsers)
	sort.Slice(sortedUsers, func(i, j int) bool {
		priorityI := sortedUsers[i].User.Priority
		priorityJ := sortedUsers[j].User.Priority
		if priorityI != priorityJ {
			return priorityI > priorityJ // Higher priority first
		}
		// Same priority: maintain queue order
		return sortedUsers[i].OrderIndex < sortedUsers[j].OrderIndex
	})

	// Delete existing assignments for this date (soft delete)
	if err := s.db.Where("date = ?", date).Delete(&models.ParkingAssignment{}).Error; err != nil {
		return fmt.Errorf("failed to delete existing assignments: %w", err)
	}

	// Assign parking spaces
	numSpaces := len(spaces)
	numPresent := len(sortedUsers)

	assignments := make([]models.ParkingAssignment, 0, numSpaces)
	assignedUserIDs := make(map[uint]bool)

	// Assign to present users up to number of spaces
	for i := 0; i < numSpaces && i < numPresent; i++ {
		user := sortedUsers[i]

		// Skip if already assigned (shouldn't happen, but safety check)
		if assignedUserIDs[user.UserID] {
			continue
		}

		assignment := models.ParkingAssignment{
			Date:           date,
			ParkingSpaceID: spaces[i].ID,
			UserID:         user.UserID,
			IsAutoAssigned: true,
		}
		assignments = append(assignments, assignment)
		assignedUserIDs[user.UserID] = true
	}

	// Create assignments
	if len(assignments) > 0 {
		if err := s.db.Create(&assignments).Error; err != nil {
			return fmt.Errorf("failed to create assignments: %w", err)
		}
	}

	return nil
}

// GetDailyParking retrieves parking assignments for a date
func (s *ParkingService) GetDailyParking(date time.Time) ([]models.ParkingAssignment, error) {
	date = time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())

	var assignments []models.ParkingAssignment
	if err := s.db.
		Preload("ParkingSpace").
		Preload("User").
		Where("date = ?", date).
		Order("parking_space_id ASC").
		Find(&assignments).Error; err != nil {
		return nil, fmt.Errorf("failed to get parking assignments: %w", err)
	}

	return assignments, nil
}

// GetWeekParking retrieves parking assignments for a week (Monday-Friday)
func (s *ParkingService) GetWeekParking(startDate time.Time) (map[string][]models.ParkingAssignment, error) {
	// Find Monday of the week
	weekday := startDate.Weekday()
	daysFromMonday := int(weekday - time.Monday)
	if daysFromMonday < 0 {
		daysFromMonday += 7
	}
	monday := startDate.AddDate(0, 0, -daysFromMonday)
	monday = time.Date(monday.Year(), monday.Month(), monday.Day(), 0, 0, 0, 0, monday.Location())

	result := make(map[string][]models.ParkingAssignment)

	// Get assignments for Monday to Friday
	for i := 0; i < 5; i++ {
		date := monday.AddDate(0, 0, i)
		assignments, err := s.GetDailyParking(date)
		if err != nil {
			return nil, err
		}
		result[date.Format("2006-01-02")] = assignments
	}

	return result, nil
}

// RotateQueue moves users who parked today to the end of the queue
func (s *ParkingService) RotateQueue(date time.Time) error {
	date = time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())

	// Get today's assignments
	var assignments []models.ParkingAssignment
	if err := s.db.Where("date = ?", date).Find(&assignments).Error; err != nil {
		return fmt.Errorf("failed to get assignments: %w", err)
	}

	if len(assignments) == 0 {
		return nil // Nothing to rotate
	}

	// Get all queue entries ordered by index
	var queue []models.ParkingQueue
	if err := s.db.Order("order_index ASC").Find(&queue).Error; err != nil {
		return fmt.Errorf("failed to get queue: %w", err)
	}

	// Get user IDs who parked today
	parkedUserIDs := make(map[uint]bool)
	for _, ass := range assignments {
		parkedUserIDs[ass.UserID] = true
	}

	// Separate parked and non-parked users
	var parkedUsers []models.ParkingQueue
	var nonParkedUsers []models.ParkingQueue

	for _, q := range queue {
		if parkedUserIDs[q.UserID] {
			parkedUsers = append(parkedUsers, q)
		} else {
			nonParkedUsers = append(nonParkedUsers, q)
		}
	}

	// Reorder: non-parked first, then parked
	newOrder := append(nonParkedUsers, parkedUsers...)

	// Update order indices
	for i, q := range newOrder {
		if err := s.db.Model(&models.ParkingQueue{}).Where("id = ?", q.ID).Update("order_index", i).Error; err != nil {
			return fmt.Errorf("failed to update queue order: %w", err)
		}
	}

	return nil
}

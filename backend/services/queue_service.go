package services

import (
	"fmt"

	"Spotly/backend/models"

	"gorm.io/gorm"
)

type QueueService struct {
	db *gorm.DB
}

func NewQueueService(db *gorm.DB) *QueueService {
	return &QueueService{db: db}
}

// InitializeQueueForUser ensures a user has a queue entry
func (s *QueueService) InitializeQueueForUser(userID uint) error {
	var queue models.ParkingQueue
	if err := s.db.Where("user_id = ?", userID).First(&queue).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Get max order index
			var maxOrder int
			s.db.Model(&models.ParkingQueue{}).Select("COALESCE(MAX(order_index), -1)").Scan(&maxOrder)

			// Create queue entry at the end
			newQueue := models.ParkingQueue{
				UserID:     userID,
				OrderIndex: maxOrder + 1,
			}
			if err := s.db.Create(&newQueue).Error; err != nil {
				return fmt.Errorf("failed to create queue entry: %w", err)
			}
		} else {
			return fmt.Errorf("failed to check queue: %w", err)
		}
	}
	return nil
}

// ReorderQueue updates queue order based on provided user IDs
func (s *QueueService) ReorderQueue(userIDs []uint) error {
	// Verify all users exist
	var count int64
	if err := s.db.Model(&models.User{}).Where("id IN ?", userIDs).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to verify users: %w", err)
	}
	if int(count) != len(userIDs) {
		return fmt.Errorf("some users not found")
	}

	// Update order indices
	for i, userID := range userIDs {
		if err := s.db.Model(&models.ParkingQueue{}).
			Where("user_id = ?", userID).
			Update("order_index", i).Error; err != nil {
			return fmt.Errorf("failed to update queue order: %w", err)
		}
	}

	return nil
}

// GetQueue returns queue in order
func (s *QueueService) GetQueue() ([]models.ParkingQueue, error) {
	var queue []models.ParkingQueue
	if err := s.db.Preload("User").Order("order_index ASC").Find(&queue).Error; err != nil {
		return nil, fmt.Errorf("failed to get queue: %w", err)
	}
	return queue, nil
}

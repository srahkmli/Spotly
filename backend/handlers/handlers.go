package handlers

import (
	"net/http"
	"strconv"
	"time"

	"Spotly/backend/models"
	"Spotly/backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db             *gorm.DB
	parkingService *services.ParkingService
	queueService   *services.QueueService
	smsService     *services.SMSService
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{
		db:             db,
		parkingService: services.NewParkingService(db),
		queueService:   services.NewQueueService(db),
		smsService:     services.NewSMSService(),
	}
}

// User Handlers
func (h *Handler) CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Initialize queue entry for new user
	if err := h.queueService.InitializeQueueForUser(user.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize queue entry"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func (h *Handler) GetUsers(c *gin.Context) {
	var users []models.User
	if err := h.db.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *Handler) GetUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var user models.User
	if err := h.db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *Handler) UpdateUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var user models.User
	if err := h.db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *Handler) DeleteUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := h.db.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}

// Attendance Handlers
func (h *Handler) MarkAttendance(c *gin.Context) {
	var req struct {
		UserID    uint   `json:"user_id" binding:"required"`
		Date      string `json:"date" binding:"required"`
		IsPresent bool   `json:"is_present"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use YYYY-MM-DD"})
		return
	}

	date = time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())

	var attendance models.Attendance
	result := h.db.Where("user_id = ? AND date = ?", req.UserID, date).First(&attendance)

	if result.Error == gorm.ErrRecordNotFound {
		attendance = models.Attendance{
			UserID:    req.UserID,
			Date:      date,
			IsPresent: req.IsPresent,
		}
		if err := h.db.Create(&attendance).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create attendance"})
			return
		}
	} else if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get attendance"})
		return
	} else {
		attendance.IsPresent = req.IsPresent
		if err := h.db.Save(&attendance).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update attendance"})
			return
		}
	}

	c.JSON(http.StatusOK, attendance)
}

func (h *Handler) GetAttendance(c *gin.Context) {
	dateStr := c.Param("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use YYYY-MM-DD"})
		return
	}

	date = time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())

	var attendances []models.Attendance
	if err := h.db.Preload("User").Where("date = ?", date).Find(&attendances).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get attendance"})
		return
	}

	c.JSON(http.StatusOK, attendances)
}

// Parking Handlers
func (h *Handler) GetTodayParking(c *gin.Context) {
	assignments, err := h.parkingService.GetDailyParking(time.Now())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, assignments)
}

func (h *Handler) GetWeekParking(c *gin.Context) {
	dateStr := c.Query("date")
	var startDate time.Time
	var err error

	if dateStr != "" {
		startDate, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use YYYY-MM-DD"})
			return
		}
	} else {
		startDate = time.Now()
	}

	weekParking, err := h.parkingService.GetWeekParking(startDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, weekParking)
}

func (h *Handler) RecalculateParking(c *gin.Context) {
	var req struct {
		Date        string `json:"date"` // Optional, defaults to today
		SendSMS     bool   `json:"send_sms"`
		RotateQueue bool   `json:"rotate_queue"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		// Default values if body is empty
		req.SendSMS = false
		req.RotateQueue = false
	}

	var date time.Time
	var err error

	if req.Date != "" {
		date, err = time.Parse("2006-01-02", req.Date)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use YYYY-MM-DD"})
			return
		}
	} else {
		date = time.Now()
	}

	// Calculate parking
	if err := h.parkingService.CalculateDailyParking(date); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Rotate queue if requested
	if req.RotateQueue {
		if err := h.parkingService.RotateQueue(date); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to rotate queue: " + err.Error()})
			return
		}
	}

	// Get assignments
	assignments, err := h.parkingService.GetDailyParking(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get assignments: " + err.Error()})
		return
	}

	// Send SMS if requested
	if req.SendSMS {
		dateStr := date.Format("2006-01-02")
		if err := h.smsService.SendParkingSMS(assignments, dateStr); err != nil {
			c.JSON(http.StatusOK, gin.H{
				"message":     "Parking recalculated but SMS failed",
				"assignments": assignments,
				"sms_error":   err.Error(),
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Parking recalculated successfully",
		"assignments": assignments,
	})
}

// Queue Handlers
func (h *Handler) GetQueue(c *gin.Context) {
	queue, err := h.queueService.GetQueue()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, queue)
}

func (h *Handler) ReorderQueue(c *gin.Context) {
	var req struct {
		UserIDs []uint `json:"user_ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.queueService.ReorderQueue(req.UserIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Queue reordered successfully"})
}

// Parking Space Handlers
func (h *Handler) GetParkingSpaces(c *gin.Context) {
	var spaces []models.ParkingSpace
	if err := h.db.Find(&spaces).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get parking spaces"})
		return
	}
	c.JSON(http.StatusOK, spaces)
}

func (h *Handler) CreateParkingSpace(c *gin.Context) {
	var space models.ParkingSpace
	if err := c.ShouldBindJSON(&space); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Create(&space).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create parking space"})
		return
	}

	c.JSON(http.StatusCreated, space)
}

func (h *Handler) DeleteParkingSpace(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := h.db.Delete(&models.ParkingSpace{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete parking space"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Parking space deleted"})
}

// SMS Handler
func (h *Handler) SendSMS(c *gin.Context) {
	var req struct {
		Date string `json:"date"` // Optional, defaults to today
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		// Default to today if body is empty
	}

	var date time.Time
	var err error

	if req.Date != "" {
		date, err = time.Parse("2006-01-02", req.Date)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use YYYY-MM-DD"})
			return
		}
	} else {
		date = time.Now()
	}

	assignments, err := h.parkingService.GetDailyParking(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	dateStr := date.Format("2006-01-02")
	if err := h.smsService.SendParkingSMS(assignments, dateStr); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "SMS sent successfully"})
}

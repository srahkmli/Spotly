package main

import (
	"log"
	"os"

	"Spotly/backend/config"
	"Spotly/backend/database"
	"Spotly/backend/handlers"
	"Spotly/backend/jobs"
	"Spotly/backend/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize database
	db, err := database.Initialize()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Auto-migrate models
	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Initialize router
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Middleware
	r.Use(middleware.CORS())
	r.Use(middleware.ErrorHandler())

	// Initialize handlers
	h := handlers.NewHandler(db)

	// API routes
	api := r.Group("/api")
	{
		// User routes
		api.POST("/users", h.CreateUser)
		api.GET("/users", h.GetUsers)
		api.GET("/users/:id", h.GetUser)
		api.PUT("/users/:id", h.UpdateUser)
		api.DELETE("/users/:id", h.DeleteUser)

		// Attendance routes
		api.POST("/attendance", h.MarkAttendance)
		api.GET("/attendance/:date", h.GetAttendance)

		// Parking routes
		api.GET("/parking/today", h.GetTodayParking)
		api.GET("/parking/week", h.GetWeekParking)
		api.POST("/parking/recalculate", h.RecalculateParking)

		// Queue routes
		api.GET("/queue", h.GetQueue)
		api.POST("/queue/reorder", h.ReorderQueue)

		// Parking spaces routes
		api.GET("/parking-spaces", h.GetParkingSpaces)
		api.POST("/parking-spaces", h.CreateParkingSpace)
		api.DELETE("/parking-spaces/:id", h.DeleteParkingSpace)

		// SMS routes
		api.POST("/sms/send", h.SendSMS)
	}

	// Start cron jobs if enabled
	if os.Getenv("ENABLE_CRON") == "true" {
		cronSchedule := os.Getenv("PARKING_CRON_SCHEDULE")
		if cronSchedule == "" {
			cronSchedule = "30 7 * * 1-5" // 7:30 AM, Monday-Friday
		}
		jobs.StartCronJobs(db, cronSchedule)
		log.Println("Cron jobs started")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}


package jobs

import (
	"log"
	"time"

	"Spotly/backend/services"

	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

func StartCronJobs(db *gorm.DB, schedule string) {
	c := cron.New(cron.WithLocation(time.UTC))

	parkingService := services.NewParkingService(db)
	smsService := services.NewSMSService()

	// Daily parking calculation job
	_, err := c.AddFunc(schedule, func() {
		log.Println("Running daily parking calculation job...")
		
		today := time.Now()
		
		// Calculate parking for today
		if err := parkingService.CalculateDailyParking(today); err != nil {
			log.Printf("Error calculating parking: %v", err)
			return
		}

		// Rotate queue (move today's parkers to end)
		if err := parkingService.RotateQueue(today); err != nil {
			log.Printf("Error rotating queue: %v", err)
			// Continue even if rotation fails
		}

		// Get assignments
		assignments, err := parkingService.GetDailyParking(today)
		if err != nil {
			log.Printf("Error getting assignments: %v", err)
			return
		}

		// Send SMS to security guard
		dateStr := today.Format("2006-01-02")
		if err := smsService.SendParkingSMS(assignments, dateStr); err != nil {
			log.Printf("Error sending SMS: %v", err)
			return
		}

		log.Println("Daily parking job completed successfully")
	})

	if err != nil {
		log.Printf("Error scheduling cron job: %v", err)
		return
	}

	c.Start()
	log.Printf("Cron job scheduled: %s", schedule)
}


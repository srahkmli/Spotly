package services

import (
	"fmt"
	"log"
	"strings"

	"Spotly/backend/config"
	"Spotly/backend/models"
)

type SMSService struct {
	provider   string
	apiKey     string
	apiSecret  string
	guardPhone string
}

func NewSMSService() *SMSService {
	cfg := config.Load()
	return &SMSService{
		provider:   cfg.SMSProvider,
		apiKey:     cfg.SMSAPIKey,
		apiSecret:  cfg.SMSAPISecret,
		guardPhone: cfg.SecurityGuardPhone,
	}
}

// FormatParkingSMS formats parking assignments into SMS message
func (s *SMSService) FormatParkingSMS(assignments []models.ParkingAssignment, date string) string {
	if len(assignments) == 0 {
		return fmt.Sprintf("Today Parking (%s):\nNo assignments", date)
	}

	var builder strings.Builder
	builder.WriteString(fmt.Sprintf("Today Parking (%s):\n\n", date))

	for _, ass := range assignments {
		spaceLabel := ass.ParkingSpace.Label
		userName := ass.User.Name
		carPlate := ass.User.CarPlate
		builder.WriteString(fmt.Sprintf("%s - %s | %s\n", spaceLabel, userName, carPlate))
	}

	return builder.String()
}

// SendSMS sends SMS message (implementation depends on provider)
func (s *SMSService) SendSMS(message string, phoneNumber string) error {
	switch s.provider {
	case "console":
		return s.sendConsoleSMS(message, phoneNumber)
	case "twilio":
		return s.sendTwilioSMS(message, phoneNumber)
	case "kavenegar":
		return s.sendKavenegarSMS(message, phoneNumber)
	default:
		log.Printf("Unknown SMS provider: %s, using console", s.provider)
		return s.sendConsoleSMS(message, phoneNumber)
	}
}

// SendParkingSMS sends parking assignments to security guard
func (s *SMSService) SendParkingSMS(assignments []models.ParkingAssignment, date string) error {
	if s.guardPhone == "" {
		return fmt.Errorf("security guard phone number not configured")
	}

	message := s.FormatParkingSMS(assignments, date)
	return s.SendSMS(message, s.guardPhone)
}

// Console SMS provider (for development/testing)
func (s *SMSService) sendConsoleSMS(message string, phoneNumber string) error {
	log.Printf("=== SMS TO %s ===\n%s\n=== END SMS ===", phoneNumber, message)
	return nil
}

// Twilio SMS provider (placeholder - implement with actual Twilio SDK)
func (s *SMSService) sendTwilioSMS(message string, phoneNumber string) error {
	if s.apiKey == "" || s.apiSecret == "" {
		return fmt.Errorf("Twilio credentials not configured")
	}
	// TODO: Implement Twilio integration
	log.Printf("Twilio SMS (not implemented): %s -> %s", phoneNumber, message)
	return nil
}

// Kavenegar SMS provider (placeholder - implement with actual Kavenegar SDK)
func (s *SMSService) sendKavenegarSMS(message string, phoneNumber string) error {
	if s.apiKey == "" {
		return fmt.Errorf("Kavenegar API key not configured")
	}
	// TODO: Implement Kavenegar integration
	log.Printf("Kavenegar SMS (not implemented): %s -> %s", phoneNumber, message)
	return nil
}

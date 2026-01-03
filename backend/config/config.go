package config

import (
	"os"
)

type Config struct {
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBSSLMode          string
	Port               string
	SMSProvider        string
	SMSAPIKey          string
	SMSAPISecret       string
	SecurityGuardPhone string
}

func Load() *Config {
	return &Config{
		DBHost:             getEnv("DB_HOST", "localhost"),
		DBPort:             getEnv("DB_PORT", "5432"),
		DBUser:             getEnv("DB_USER", "postgres"),
		DBPassword:         getEnv("DB_PASSWORD", "postgres"),
		DBName:             getEnv("DB_NAME", "spotly"),
		DBSSLMode:          getEnv("DB_SSLMODE", "disable"),
		Port:               getEnv("PORT", "8080"),
		SMSProvider:        getEnv("SMS_PROVIDER", "console"),
		SMSAPIKey:          getEnv("SMS_API_KEY", ""),
		SMSAPISecret:       getEnv("SMS_API_SECRET", ""),
		SecurityGuardPhone: getEnv("SECURITY_GUARD_PHONE", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

.PHONY: help backend frontend setup

help:
	@echo "Spotly Parking Management System"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup      - Set up the project (copy .env files)"
	@echo "  make backend    - Run the backend server"
	@echo "  make frontend   - Run the frontend server"
	@echo "  make install    - Install all dependencies"

setup:
	@echo "Setting up environment files..."
	@if [ ! -f backend/.env ]; then \
		cp .env.example backend/.env 2>/dev/null || echo "Please create backend/.env manually"; \
	fi
	@if [ ! -f frontend/.env.local ]; then \
		cp frontend/.env.local.example frontend/.env.local 2>/dev/null || echo "Please create frontend/.env.local manually"; \
	fi
	@echo "Setup complete! Please edit .env files with your configuration."

install:
	@echo "Installing backend dependencies..."
	cd backend && go mod tidy
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installation complete!"

backend:
	cd backend && go run main.go

frontend:
	cd frontend && npm run dev


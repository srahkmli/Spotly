# Quick Start Guide

Get Spotly up and running in minutes!

## Prerequisites Check

Make sure you have:
- ✅ PostgreSQL installed and running
- ✅ Go 1.21+ installed
- ✅ Node.js 18+ installed

## Step-by-Step Setup

### 1. Database Setup

```bash
# Create database
createdb spotly

# Or using psql
psql -U postgres -c "CREATE DATABASE spotly;"
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Copy environment file
cp ../.env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=spotly

# Install dependencies
go mod tidy

# Run backend (will auto-migrate database)
go run main.go
```

Backend should now be running on `http://localhost:8080`

### 3. Frontend Setup

In a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Run development server
npm run dev
```

Frontend should now be running on `http://localhost:3000`

### 4. Initial Configuration

1. **Open the frontend**: http://localhost:3000

2. **Add Parking Spaces**:
   - Go to "Parking Spaces"
   - Add spaces (e.g., A1, A2, A3)

3. **Add Users**:
   - Go to "Users"
   - Add users with:
     - Name
     - Car Plate
     - Phone Number
     - Priority (optional, defaults to 0)

4. **Configure Queue** (optional):
   - Go to "Queue"
   - Drag and drop to reorder users

5. **Calculate Parking**:
   - Go to "Dashboard"
   - Click "Recalculate" to assign parking

## Daily Workflow

1. **Mark Attendance**:
   - Go to "Attendance"
   - Select date
   - Toggle present/absent for each user

2. **Calculate Parking**:
   - Go to "Dashboard"
   - Click "Recalculate"

3. **Send SMS** (optional):
   - Click "Send SMS" on dashboard
   - SMS sent to security guard

## Automated Daily Job

The system can automatically:
- Calculate parking at 7:30 AM (Monday-Friday)
- Rotate queue
- Send SMS

Enable in `.env`:
```
ENABLE_CRON=true
PARKING_CRON_SCHEDULE=30 7 * * 1-5
```

## Troubleshooting

### Backend won't start

- Check PostgreSQL is running: `psql -U postgres -c "SELECT 1;"`
- Verify database exists: `psql -U postgres -l | grep spotly`
- Check `.env` file has correct credentials
- Check port 8080 is not in use

### Frontend won't start

- Check Node.js version: `node --version` (should be 18+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check port 3000 is not in use

### Database connection errors

- Verify PostgreSQL is running
- Check database credentials in `.env`
- Test connection: `psql -h localhost -U postgres -d spotly`

### API errors

- Check backend is running on port 8080
- Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Check browser console for errors

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize SMS provider settings
- Set up production deployment
- Configure cron jobs for automation

Happy parking management! 🚗


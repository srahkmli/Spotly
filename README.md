# 🚗 Spotly - Parking Management System

<div align="center">

![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go)
![Next.js](https://img.shields.io/badge/Next.js-14.0-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-4169E1?style=for-the-badge&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A comprehensive parking management system for managing limited parking spaces with automatic assignment, queue management, and SMS notifications.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🔧 Backend (Go)
- ✅ **RESTful API** with Gin framework
- ✅ **PostgreSQL** database with GORM ORM
- ✅ **Automatic parking assignment** algorithm with priority support
- ✅ **Queue management** with fair rotation system
- ✅ **Daily attendance tracking** for all users
- ✅ **Cron jobs** for automated daily calculations
- ✅ **SMS integration** (console, Twilio, Kavenegar ready)
- ✅ **Weekly schedule generation** (Monday-Friday)

### 🎨 Frontend (Next.js + TypeScript)
- ✅ **Modern React UI** with Tailwind CSS
- ✅ **Dashboard** with today's parking assignments
- ✅ **Weekly schedule view** with calendar interface
- ✅ **User management** with full CRUD operations
- ✅ **Parking space configuration** management
- ✅ **Queue management** with drag-and-drop reordering
- ✅ **Real-time updates** and optimistic UI
- ✅ **Responsive design** for mobile and desktop

## 🚀 Quick Start

### Prerequisites

- **Go** 1.21 or higher
- **PostgreSQL** 12 or higher
- **Node.js** 18 or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/srahkmli/Spotly.git
   cd Spotly
   ```

2. **Set up the database**
   ```bash
   createdb spotly
   # Or using psql
   psql -U postgres -c "CREATE DATABASE spotly;"
   ```

3. **Configure backend**
   ```bash
   cd backend
   cp ../.env.example .env
   # Edit .env with your database credentials
   go mod tidy
   go run main.go
   ```

4. **Configure frontend** (in a new terminal)
   ```bash
   cd frontend
   cp .env.local.example .env.local
   npm install
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

> 📖 For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md)

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Detailed setup and usage guide
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Architecture and code structure
- **[API Documentation](#-api-endpoints)** - Complete API reference

## 🏗️ Project Structure

```
Spotly/
├── backend/                    # Go backend application
│   ├── config/                # Configuration management
│   ├── database/              # Database connection & migrations
│   ├── handlers/              # HTTP request handlers
│   ├── jobs/                  # Cron job scheduler
│   ├── middleware/            # CORS, error handling
│   ├── models/                # Database models (GORM)
│   ├── services/              # Business logic layer
│   └── main.go                # Application entry point
│
├── frontend/                   # Next.js frontend application
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   ├── lib/                   # API client & utilities
│   ├── store/                 # Zustand state management
│   └── types/                 # TypeScript type definitions
│
└── docs/                      # Additional documentation
```

## 🔌 API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Attendance
- `POST /api/attendance` - Mark attendance (present/absent)
- `GET /api/attendance/:date` - Get attendance for specific date

### Parking
- `GET /api/parking/today` - Get today's parking assignments
- `GET /api/parking/week` - Get week's parking assignments
- `POST /api/parking/recalculate` - Recalculate parking for a date

### Queue
- `GET /api/queue` - Get current queue order
- `POST /api/queue/reorder` - Reorder queue (array of user IDs)

### Parking Spaces
- `GET /api/parking-spaces` - Get all parking spaces
- `POST /api/parking-spaces` - Create parking space
- `DELETE /api/parking-spaces/:id` - Delete parking space

### SMS
- `POST /api/sms/send` - Send SMS with parking assignments

## 💡 Usage

### Initial Setup

1. **Add Parking Spaces**
   - Navigate to "Parking Spaces" page
   - Add spaces (e.g., A1, A2, A3, B1, B2)

2. **Add Users**
   - Go to "Users" page
   - Add users with name, car plate, phone number, and optional priority
   - Users are automatically added to the queue

3. **Configure Queue** (optional)
   - Visit "Queue" page
   - Drag and drop to reorder users
   - Queue order determines parking assignment priority

### Daily Operations

1. **Mark Attendance**
   - Go to "Attendance" page
   - Select the date
   - Toggle present/absent for each user
   - Absent users are automatically excluded from parking assignments

2. **Calculate Parking**
   - Click "Recalculate" on the dashboard
   - System automatically assigns parking based on:
     - Queue order
     - User priority (higher priority first)
     - Attendance status
     - Available spaces

3. **Send SMS**
   - Click "Send SMS" button on dashboard
   - SMS includes all parking assignments formatted for security guard

### Automated Jobs

The system includes a cron job that runs daily (default: 7:30 AM, Monday-Friday):

- Calculates parking assignments automatically
- Rotates queue (moves today's parkers to end)
- Sends SMS to security guard

Configure in `.env`:
```env
ENABLE_CRON=true
PARKING_CRON_SCHEDULE=30 7 * * 1-5
```

## 🧠 Business Logic

### Parking Assignment Algorithm

1. **Get all parking spaces** from database
2. **Get all users** in queue order (with preloaded user data)
3. **Filter users by attendance** (present users only)
4. **Sort by priority** (higher priority first), then by queue order
5. **Assign spaces** to present users up to available space count
6. **Handle edge cases**:
   - Fewer present users than spaces → some spaces remain empty
   - All users absent → no assignments created
   - More users than spaces → queue order determines assignment

### Queue Rotation

After daily parking assignment:
- Users who parked today move to the end of the queue
- Ensures fair rotation among all users
- Maintains queue order for non-parked users

### Attendance Handling

- If no attendance record exists, user is assumed **present**
- Absent users are excluded from parking assignments
- Attendance can be marked in advance or on the same day
- Recalculation fixes assignments when attendance changes

## 📧 SMS Integration

The system supports multiple SMS providers:

### Console (Development)
Logs SMS to console. Default for development and testing.

### Twilio (Production)
```env
SMS_PROVIDER=twilio
SMS_API_KEY=your_twilio_account_sid
SMS_API_SECRET=your_twilio_auth_token
SECURITY_GUARD_PHONE=+1234567890
```

### Kavenegar (Production)
```env
SMS_PROVIDER=kavenegar
SMS_API_KEY=your_kavenegar_api_key
SECURITY_GUARD_PHONE=+989123456789
```

> **Note:** Twilio and Kavenegar integrations require actual SDK implementations. See `backend/services/sms_service.go` for details.

## ⚙️ Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | *required* |
| `DB_NAME` | Database name | `spotly` |
| `DB_SSLMODE` | SSL mode | `disable` |
| `PORT` | API server port | `8080` |
| `GIN_MODE` | Gin mode (debug/release) | `debug` |
| `SMS_PROVIDER` | SMS provider | `console` |
| `SMS_API_KEY` | SMS API key | - |
| `SMS_API_SECRET` | SMS API secret | - |
| `SECURITY_GUARD_PHONE` | Security guard phone | - |
| `ENABLE_CRON` | Enable cron jobs | `true` |
| `PARKING_CRON_SCHEDULE` | Cron schedule | `30 7 * * 1-5` |

### Frontend (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api` |

## 🔒 Edge Cases Handled

- ✅ Fewer present users than parking spaces
- ✅ All users absent on a day
- ✅ Same user marked absent after assignment (recalculation fixes)
- ✅ Manual override capability (via API)
- ✅ Changing number of parking spaces dynamically
- ✅ Last-minute attendance changes
- ✅ Priority-based assignment with queue fallback

## 🛠️ Development

### Backend Development
```bash
cd backend
go run main.go
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
cd backend
go build -o spotly-backend main.go
./spotly-backend
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

Or deploy to **Vercel/Netlify**:
```bash
npm run build
# Deploy the .next directory
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For detailed contributing guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Gin](https://gin-gonic.com/) and [Next.js](https://nextjs.org/)
- UI styled with [Tailwind CSS](https://tailwindcss.com/)
- State management with [Zustand](https://github.com/pmndrs/zustand)

## 📧 Support

For issues, questions, or suggestions, please [open an issue](https://github.com/srahkmli/Spotly/issues) on GitHub.

---

<div align="center">

**Made with ❤️ for efficient parking management**

⭐ Star this repo if you find it helpful!

</div>

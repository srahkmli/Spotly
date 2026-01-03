# Project Structure

## Complete File Tree

```
Spotly/
├── backend/                    # Go backend application
│   ├── config/
│   │   └── config.go          # Configuration management
│   ├── database/
│   │   └── database.go        # Database connection & migrations
│   ├── handlers/
│   │   └── handlers.go        # HTTP request handlers (all endpoints)
│   ├── jobs/
│   │   └── cron.go            # Cron job scheduler
│   ├── middleware/
│   │   └── middleware.go      # CORS, error handling
│   ├── models/
│   │   └── models.go          # Database models (GORM)
│   ├── services/
│   │   ├── parking_service.go # Parking assignment logic
│   │   ├── queue_service.go   # Queue management logic
│   │   └── sms_service.go     # SMS integration
│   └── main.go                # Application entry point
│
├── frontend/                   # Next.js frontend application
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── attendance/
│   │   │   └── page.tsx       # Attendance management page
│   │   ├── queue/
│   │   │   └── page.tsx       # Queue management page
│   │   ├── spaces/
│   │   │   └── page.tsx       # Parking spaces page
│   │   ├── users/
│   │   │   └── page.tsx       # User management page
│   │   ├── week/
│   │   │   └── page.tsx       # Weekly schedule page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard (home page)
│   ├── components/             # React components
│   │   ├── AttendanceSwitch.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Navigation.tsx
│   │   ├── ParkingSpaceCard.tsx
│   │   ├── QueueList.tsx
│   │   ├── UserModal.tsx
│   │   └── UserRow.tsx
│   ├── lib/
│   │   └── api.ts             # API client (Axios)
│   ├── store/
│   │   └── store.ts           # Zustand state management
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── .env.example               # Backend environment template
├── .gitignore
├── go.mod                     # Go module definition
├── go.sum                     # Go dependencies checksum
├── Makefile                   # Build automation
├── PROJECT_STRUCTURE.md       # This file
├── QUICKSTART.md              # Quick setup guide
└── README.md                  # Full documentation
```

## Key Components

### Backend Architecture

**Models** (`backend/models/models.go`)
- `User`: Person with car plate and contact info
- `ParkingSpace`: Physical parking spot (A1, A2, etc.)
- `ParkingQueue`: Queue ordering for fair rotation
- `Attendance`: Daily presence tracking
- `ParkingAssignment`: Daily parking assignments

**Services** (`backend/services/`)
- `ParkingService`: Core parking assignment algorithm
  - `CalculateDailyParking()`: Assigns parking based on queue + attendance
  - `GetDailyParking()`: Retrieves assignments for a date
  - `GetWeekParking()`: Retrieves weekly schedule
  - `RotateQueue()`: Moves today's parkers to end of queue
- `QueueService`: Queue management
  - `InitializeQueueForUser()`: Auto-add user to queue
  - `ReorderQueue()`: Update queue order
  - `GetQueue()`: Retrieve queue
- `SMSService`: SMS notifications
  - Multiple provider support (console, Twilio, Kavenegar)
  - Formatting and sending

**Handlers** (`backend/handlers/handlers.go`)
- User CRUD operations
- Attendance marking
- Parking calculation & retrieval
- Queue management
- Parking space management
- SMS sending

**Jobs** (`backend/jobs/cron.go`)
- Daily automated parking calculation
- Queue rotation
- SMS sending

### Frontend Architecture

**Pages** (`frontend/app/`)
- `/`: Dashboard with today's parking
- `/week`: Weekly schedule view
- `/attendance`: Attendance management
- `/users`: User CRUD
- `/queue`: Queue visualization & reordering
- `/spaces`: Parking space configuration

**Components** (`frontend/components/`)
- Reusable UI components
- Form modals
- Data tables
- Interactive switches

**State Management** (`frontend/store/store.ts`)
- Zustand store
- API integration
- Centralized state

**API Client** (`frontend/lib/api.ts`)
- Axios-based API client
- Type-safe API calls
- Error handling

## Data Flow

1. **User adds parking spaces** → Stored in `ParkingSpace` table
2. **User adds users** → Stored in `User` table + auto-added to `ParkingQueue`
3. **User marks attendance** → Stored in `Attendance` table
4. **System calculates parking** → `ParkingService.CalculateDailyParking()`
   - Filters by attendance
   - Sorts by priority + queue order
   - Creates `ParkingAssignment` records
5. **User views assignments** → Fetched from `ParkingAssignment` table
6. **Queue rotates** → `ParkingService.RotateQueue()` updates queue order
7. **SMS sent** → `SMSService.SendParkingSMS()` formats and sends

## Technology Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: Gin
- **ORM**: GORM
- **Database**: PostgreSQL
- **Cron**: robfig/cron/v3
- **Environment**: godotenv

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP Client**: Axios
- **Icons**: Heroicons
- **Notifications**: react-hot-toast
- **Date Utils**: date-fns

## API Endpoints Summary

### Users
- `POST /api/users` - Create
- `GET /api/users` - List all
- `GET /api/users/:id` - Get one
- `PUT /api/users/:id` - Update
- `DELETE /api/users/:id` - Delete

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/:date` - Get by date

### Parking
- `GET /api/parking/today` - Today's assignments
- `GET /api/parking/week` - Week's assignments
- `POST /api/parking/recalculate` - Recalculate

### Queue
- `GET /api/queue` - Get queue
- `POST /api/queue/reorder` - Reorder queue

### Parking Spaces
- `GET /api/parking-spaces` - List all
- `POST /api/parking-spaces` - Create
- `DELETE /api/parking-spaces/:id` - Delete

### SMS
- `POST /api/sms/send` - Send SMS

## Database Schema

### Tables
1. **users** - User information
2. **parking_spaces** - Available parking spots
3. **parking_queue** - Queue ordering
4. **attendances** - Daily presence records
5. **parking_assignments** - Daily assignments

All tables use soft deletes (deleted_at) except queue.

## Environment Variables

See `.env.example` and `README.md` for complete list.

Key variables:
- Database connection
- Server port
- SMS provider configuration
- Cron schedule


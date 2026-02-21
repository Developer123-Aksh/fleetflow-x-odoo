# FleetFlow - Fleet Management System

A complete fleet management system built for the Odoo Hackathon.

## Tech Stack

- **Frontend:** React 19 + React Router
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Authentication:** JWT

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend/fleetflow/backend
npm install
npm start
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend/frontend
npm install
npm start
```

Frontend runs on `http://localhost:3001`

## Features

- **Authentication** - JWT-based login/register with role-based access
- **Dashboard** - Real-time KPIs (Active Fleet, Maintenance Alerts, Utilization Rate)
- **Vehicle Registry** - CRUD operations with vehicle type, make, model, capacity
- **Driver Management** - License tracking, safety scores, duty status
- **Trip Dispatcher** - Create trips with validation (cargo ≤ capacity)
- **Maintenance** - Service logs with auto status updates (In Shop)
- **Expenses** - Fuel and repair expense tracking per vehicle
- **Analytics** - Fuel efficiency, ROI calculations, monthly summaries

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `/auth/register`, `/auth/login`, `/auth/me` |
| Vehicles | `/vehicles` (GET, POST, PUT, DELETE) |
| Drivers | `/drivers` (GET, POST, PUT, DELETE) |
| Trips | `/trips` (GET, POST, PUT, DELETE) |
| Maintenance | `/maintenance` (GET, POST, PUT, DELETE) |
| Expenses | `/expenses` (GET, POST, PUT, DELETE) |
| Dashboard | `/dashboard/stats`, `/dashboard/analytics` |

## Environment Variables

**Backend** (`.env`):
```
MONGO_URI=mongodb://localhost:27017/fleetflow
```

**Frontend** (`.env`):
```
REACT_APP_API_URL=http://localhost:3000
```

## Default Test User

- Email: `admin@fleet.com`
- Password: `1234`

Or register a new user from the login page.

## Project Structure

```
fleetflow-x-odoo/
├── backend/fleetflow/backend/
│   ├── models/         # MongoDB schemas
│   ├── routes/        # API endpoints
│   └── server.js      # Express server
├── frontend/frontend/
│   ├── src/
│   │   ├── pages/     # React pages
│   │   ├── components/
│   │   ├── context/   # Auth context
│   │   └── api/       # API service
│   └── public/
└── README.md
```

## Running Tests (Backend)

```bash
cd backend/fleetflow/backend
npm test
```

## License

MIT

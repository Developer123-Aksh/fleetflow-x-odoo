# FleetFlow Frontend

React-based frontend for the FleetFlow fleet management system.

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
cd frontend/frontend
npm install
```

## Configuration

Create a `.env` file in `frontend/frontend/` (already included):

```
REACT_APP_API_URL=http://localhost:3000
```

## Running

```bash
npm start
```

The app will run on http://localhost:3001

## Project Structure

```
src/
├── api/
│   └── index.js          # API service layer
├── components/
│   ├── KPI.jsx           # Dashboard KPI cards
│   ├── Modal.jsx         # Reusable modal
│   ├── Sidebar.jsx       # Navigation sidebar
│   ├── StatusPill.jsx    # Status badge component
│   ├── Table.jsx         # Reusable data table
│   └── Toast.jsx         # Toast notifications
├── context/
│   └── AuthContext.jsx  # Authentication state
├── pages/
│   ├── Analytics.jsx     # Reports & analytics
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Dispatcher.jsx   # Trip management
│   ├── Drivers.jsx      # Driver management
│   ├── FuelExpenses.jsx # Expense tracking
│   ├── Login.jsx        # Auth page
│   ├── Maintenance.jsx  # Service logs
│   └── Vehicles.jsx     # Vehicle registry
├── utils/
│   ├── calculations.js  # Utility functions
│   └── validation.js     # Form validation
├── App.js               # Main app component
├── index.js             # Entry point
└── styles.css           # Global styles
```

## Features

- **Dashboard** - Real-time fleet KPIs with auto-refresh
- **Vehicles** - Add, edit, delete vehicles with validation
- **Drivers** - Driver profiles with license tracking
- **Dispatcher** - Trip creation with vehicle/driver validation
- **Maintenance** - Service log management
- **Fuel & Expenses** - Expense tracking per vehicle
- **Analytics** - Fleet performance metrics and reports
- **Authentication** - JWT-based login/register

## API Endpoints

The frontend connects to these backend endpoints:

| Module | Endpoints |
|--------|-----------|
| Auth | `/auth/login`, `/auth/register`, `/auth/me` |
| Vehicles | `/vehicles` (GET, POST, PUT, DELETE) |
| Drivers | `/drivers` (GET, POST, PUT, DELETE) |
| Trips | `/trips` (GET, POST, PUT, DELETE) |
| Maintenance | `/maintenance` (GET, POST, PUT, DELETE) |
| Expenses | `/expenses` (GET, POST, PUT, DELETE) |
| Dashboard | `/dashboard/stats`, `/dashboard/analytics` |

## Tech Stack

- React 19
- React Router 7
- Fetch API
- CSS (custom styles)

## Notes

- Frontend expects backend running on port 3000
- Token-based authentication with JWT
- Data is persisted in MongoDB via the backend API

# FleetFlow Backend

Node.js/Express API for fleet management.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start MongoDB:
   ```bash
   mongod --dbpath /path/to/data
   ```

3. Run server:
   ```bash
   npm start
   ```

## Run Tests

```bash
npm test
```

## API Endpoints

- `GET/POST /vehicles`
- `GET/POST /drivers`
- `GET/POST /trips`
- `GET/POST /maintenance`

## Environment

Create `.env` file:
```
MONGO_URI=mongodb://localhost:27017/fleetflow
```

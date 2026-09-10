# ⚡ FleetPulse — Real-Time Fleet & Vehicle Telemetry Backend

FleetPulse is a production-style, high-performance Node.js / Express backend designed for real-time fleet operations and vehicle telemetry monitoring. It continuously simulates a realistic fleet of commercial vehicles across Indian logistics corridors, derives dynamic health statuses from sensor telemetry, manages threshold alerting, streams real-time updates over **Socket.IO**, and serves aggregated dashboard analytics and time-series trends via REST APIs.

---

## 🌟 Key Architecture & Features

1. **Domain-Specific Telemetry Simulation Engine**:
   - Physics-based realistic metrics: speed fluctuations (40–110 km/h), dynamic fuel consumption, thermal dynamics (speed-dependent engine temperature), battery drain/regeneration, and GPS tracking.
   - Configurable generation interval (`TELEMETRY_INTERVAL=2000`).
   - Automated event type transitions: `UPDATE`, `ALERT` (threshold breach), `RECOVERY` (return to normal).

2. **Real-Time WebSockets via Socket.IO**:
   - Live broadcasting of `telemetry:update` payloads to connected clients without page reloads.
   - Dedicated events for `alert:new` and `alert:resolved`.
   - Vehicle-specific room subscription support (`vehicle:TRUCK-001`).

3. **Periodic Aggregation & Analytics REST APIs**:
   - `/api/dashboard/summary`: High-level fleet metrics, active count, averages, total distance, active alerts, trend deltas, and dynamic 0–100 fleet health score.
   - `/api/dashboard/alerts`: Centralized threshold alerts with severity, status, and search filters.
   - `/api/dashboard/trends`: Multi-interval historical time-series aggregation (`24h`, `7d`, `30d`).

4. **Security & Production Best Practices**:
   - JWT authentication stored in secure **HTTP-only cookies** (or `Authorization: Bearer <token>`).
   - Rate limiting via `express-rate-limit` (brute-force protection on auth endpoints).
   - HTTP security headers with `helmet`.
   - CORS support with configurable `CLIENT_URL`.
   - Password hashing with `bcryptjs` and `select: false` model exclusion.
   - Centralized error handling and standardized JSON response envelopes.
   - TTL indexes on telemetry logs for controlled database growth.
   - Graceful shutdown handlers for `SIGINT` and `SIGTERM`.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (ES Modules, JavaScript)
- **Framework**: Express.js
- **Database & ODM**: MongoDB + Mongoose (with in-memory dev fallback)
- **Real-Time Layer**: Socket.IO
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Security & Utilities**: `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, `dotenv`, `morgan`

---

## 📁 Project Structure

```
backend/
├── .env.example                # Example environment configuration
├── .env                        # Local active configuration
├── package.json                # Project dependencies and npm scripts
├── README.md                   # Complete documentation
├── scripts/
│   ├── seed.js                 # Standalone database seed runner
│   └── verify.js               # Comprehensive automated test suite
└── src/
    ├── app.js                  # Express application setup & middleware pipeline
    ├── server.js               # HTTP & Socket.IO server bootstrap + graceful shutdown
    ├── config/
    │   ├── db.js               # Mongoose connection with auto dev fallback
    │   └── env.js              # Centralized environment variables & alert thresholds
    ├── controllers/
    │   ├── auth.controller.js  # Register, Login, Me, Logout
    │   ├── dashboard.controller.js # Summary, Alerts, Trends
    │   ├── vehicle.controller.js   # Fleet list, Vehicle details, Telemetry log
    │   └── alert.controller.js     # Alert queries and manual resolve
    ├── models/
    │   ├── User.js             # User auth model
    │   ├── Vehicle.js          # Fleet vehicle entity with live state & location
    │   ├── Telemetry.js        # Historical telemetry points with TTL index
    │   └── Alert.js            # Active and resolved alerts
    ├── middleware/
    │   ├── auth.middleware.js  # JWT cookie/header validation & role auth
    │   ├── error.middleware.js # Centralized error handler
    │   ├── notFound.middleware.js # 404 handler
    │   └── rateLimit.middleware.js# Auth and API rate limiters
    ├── routes/
    │   ├── index.js            # Aggregated routes + /api/health
    │   ├── auth.routes.js      # /api/auth
    │   ├── dashboard.routes.js # /api/dashboard
    │   ├── vehicle.routes.js   # /api/vehicles
    │   └── alert.routes.js     # /api/alerts
    ├── services/
    │   ├── alert.service.js    # Threshold check & alert lifecycle engine
    │   ├── analytics.service.js# Summary & trend calculations
    │   └── telemetry.service.js# Continuous live simulation & socket broadcasting
    ├── socket/
    │   └── socket.js           # Socket.IO connection & room management
    └── utils/
        ├── apiResponse.js      # Standardized JSON response helpers
        ├── generateTelemetry.js# Physics-based simulation formulas & status derivation
        └── generateVehicles.js # 18 preset fleet vehicles across Indian cities
```

---

## ⚙️ Environment Configuration (`.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/fleetpulse
JWT_SECRET=fleetpulse_super_secret_production_key_9837498234
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
TELEMETRY_INTERVAL=2000

# Centralized Alert Thresholds
TEMPERATURE_WARNING=90
TEMPERATURE_CRITICAL=100
FUEL_WARNING=25
FUEL_CRITICAL=10
BATTERY_WARNING=30
BATTERY_CRITICAL=15
SPEED_WARNING=100
SPEED_CRITICAL=120
```

---

## 👤 Demo Login Credentials

The server automatically initializes this admin account on first startup:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@fleetpulse.com` | `Admin@123` |
| **Dispatcher** (via seed script) | `dispatcher@fleetpulse.com` | `Dispatcher@123` |

---

## 🚦 Status Derivation & Centralized Threshold Logic

FleetPulse derives vehicle statuses deterministically:

- **OK**: `temperature < 90°C` AND `fuel > 25%` AND `battery > 30%`
- **WARN**: `temperature >= 90°C` OR `fuel <= 25%` OR `battery <= 30%`
- **CRITICAL**: `temperature >= 100°C` OR `fuel <= 10%` OR `battery <= 15%`

### Event Types:
- `ALERT`: Triggered on initial transition into `WARN` or `CRITICAL`.
- `RECOVERY`: Triggered when vehicle metrics return to `OK`.
- `UPDATE`: Standard continuous telemetry.

---

## 📡 Socket.IO Real-Time Architecture

Connect a frontend client using `socket.io-client`:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true,
});

// Listen for live vehicle telemetry updates (emitted every 1-2s)
socket.on('telemetry:update', (data) => {
  console.log('Vehicle Update:', data);
});

// Listen for new alerts
socket.on('alert:new', (alert) => {
  console.log('New Alert:', alert);
});

// Listen for auto-resolved alerts
socket.on('alert:resolved', (alert) => {
  console.log('Resolved Alert:', alert);
});
```

### `telemetry:update` Payload Format:
```json
{
  "vehicleId": "TRUCK-001",
  "speed": 68.4,
  "fuelLevel": 81.2,
  "engineTemperature": 83.5,
  "batteryLevel": 93.8,
  "status": "OK",
  "eventType": "UPDATE",
  "location": {
    "city": "Delhi",
    "state": "Delhi",
    "lat": 28.61432,
    "lng": 77.20945,
    "heading": 46,
    "address": "NH-48, Mahipalpur Logistics Hub"
  },
  "totalDistance": 45280.45,
  "timestamp": "2026-09-08T07:45:00.000Z"
}
```

---

## 📊 Periodic Polling vs. Real-Time Architecture

- **Real-Time Stream (Socket.IO)**: High-frequency telemetry updates (speed, fuel, temperature, coordinates) sent every 2 seconds for live gauge animations, moving vehicle maps, and instantaneous threshold alerts without frontend polling overhead.
- **Periodic REST APIs (HTTP)**: Low-frequency aggregated statistical summaries (`/summary`), historical chart points (`/trends`), and filtered tabular records (`/vehicles`, `/alerts`) consumed on page navigation or background refresh (e.g. every 30–60s).

---

## 📚 REST API Endpoint Documentation

### Standard Response Envelopes
- **Success**: `{ "success": true, "data": ... }`
- **Error**: `{ "success": false, "message": "..." }`

---

### 1. System Health
#### `GET /api/health`
Returns system status, service name, uptime, and timestamp.

---

### 2. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new fleet user | No |
| `POST` | `/api/auth/login` | Login user, sets HTTP-only cookie + returns JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `POST` | `/api/auth/logout` | Clear HTTP-only cookie | Yes |

---

### 3. Dashboard (`/api/dashboard`)
*All dashboard endpoints require authentication.*

#### `GET /api/dashboard/summary`
Returns high-level aggregated fleet metrics and dynamic health score.
```json
{
  "success": true,
  "data": {
    "totalVehicles": 18,
    "activeVehicles": 16,
    "averageSpeed": 62.4,
    "averageFuelLevel": 71.8,
    "averageTemperature": 81.2,
    "totalDistance": 894500,
    "activeAlerts": 3,
    "fleetHealth": 92,
    "trend": {
      "speed": 3.8,
      "fuel": -1.5,
      "alerts": 3.3
    }
  },
  "lastUpdated": "2026-09-08T07:45:00.000Z"
}
```

#### `GET /api/dashboard/alerts`
Query params: `severity` (`INFO`\|`WARNING`\|`CRITICAL`), `status` (`ACTIVE`\|`RESOLVED`), `vehicleId`, `search`, `page`, `limit`.

#### `GET /api/dashboard/trends`
Query param: `period` (`24h`, `7d`, `30d`).
```json
{
  "success": true,
  "data": {
    "period": "24h",
    "points": [
      {
        "timestamp": "2026-09-08T06:00:00.000Z",
        "averageSpeed": 64.2,
        "averageFuel": 74.1,
        "averageTemperature": 80.5,
        "alerts": 1
      }
    ]
  }
}
```

---

### 4. Vehicles (`/api/vehicles`)
*All vehicle endpoints require authentication.*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vehicles` | List fleet vehicles with search, status & type filters |
| `GET` | `/api/vehicles/:vehicleId` | Single vehicle live telemetry snapshot & metadata |
| `GET` | `/api/vehicles/:vehicleId/telemetry` | Historical telemetry time-series for charts |
| `GET` | `/api/vehicles/:vehicleId/alerts` | Alert log for specific vehicle |

---

## 🚀 Getting Started

### 1. Installation
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Seed Database (Optional / Automatic)
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Verification Test Suite
```bash
npm run test:verify
```

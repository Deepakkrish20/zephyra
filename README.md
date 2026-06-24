# Zephyra
> **Smart Commerce. Real-Time Delivery.**

Zephyra is an enterprise-grade, role-based E-Commerce platform with Real-Time Delivery GPS Tracking. It features a complete monorepo setup supporting Customers, Administrators, and Delivery Agents.

---

## 1. Project Overview

This repository houses the base workspace architecture for Zephyra, built to minimize integration merge conflicts for simultaneous developers using domain-based folders, clean layout routes, centralized APIs, and unified state systems.

### Core Workflow:
1. **Admin** registers/publishes a product via the Operations console.
2. **Customer** adds product to cart and places an order.
3. **Admin** approves the order, auto-dispatching a WebSocket request to couriers.
4. **Delivery Agent** accepts the job off the disponible offers list.
5. **Agent** simulates transit GPS logs, broadcasting live telemetry.
6. **Customer & Admin** monitor the agent moving live on OpenStreetMap (Leaflet).

---

## 2. Folder Structure

```
zephyra/
├── docs/                     # Git strategy, workflows
├── client/                   # Vite + React 19 Frontend
│   ├── src/
│   │   ├── app/              # Main App entrypoint & routing
│   │   ├── components/       # Design System UI Primitives (Button, Input, Card, Modal, Loader, Badge)
│   │   ├── constants/        # Role identifiers
│   │   ├── features/         # Modular domain sub-logic
│   │   ├── layouts/          # Responsive navigation wrappers (Public, Customer, Admin, Delivery)
│   │   ├── pages/            # View pages mapping routes
│   │   ├── routes/           # Security gateway routers (AppRoutes, ProtectedRoute, RoleRoute)
│   │   ├── services/         # Axios central configuration & request modules
│   │   ├── store/            # Zustand modular state stores
│   │   └── utils/            # General helpers (Theme triggers)
└── server/                   # Node.js + Express + Socket.IO Backend
    ├── src/
    │   ├── config/           # Database & integration configs
    │   ├── constants/        # Roles & socket event definitions
    │   ├── middlewares/      # Express authorization & error triggers
    │   ├── models/           # Mongoose placeholder models (User, Product, Order, Tracking, Notification)
    │   ├── sockets/          # Socket.io connection lifecycle
    │   ├── tracking/         # GPS location calculations & websockets namespace
    │   └── routes/           # Endpoint controllers
```

---

## 3. Installation Guide

### Prerequisites:
- **Node.js**: LTS version (v18.x or above recommended)
- **MongoDB**: Active database instance (Local or Atlas)

### Workspace Bootstrap:
Run standard workspace package installations from the monorepo root:
```bash
# Installs root dependencies, client, and server packages in a single run
npm install
```

### Configuration:
Verify environment variables are set inside the respective folders:
- `client/.env` (Configured to port `http://localhost:5000/api`)
- `server/.env` (Configured to database `mongodb://localhost:27017/zephyra` and port `5000`)

---

## 4. Development Workflow

### Starting the Servers Concurrently:
Launch client and server in development mode simultaneously from the root:
```bash
npm run dev
```
- **Client App URL**: `http://localhost:5173`
- **Server API URL**: `http://localhost:5000`

### Coding Standards:
- **Linting & Formatting**: Ensure lint checks pass before commits.
  ```bash
  # Check formatting and syntax
  npm run lint
  
  # Auto-format all client and server javascript files
  npm run format
  ```
- **Path Aliases**:
  - **Client**: Import using the `@` alias referencing the `client/src` directory (e.g., `import Button from '@/components/Button'`).
  - **Server**: Import using Node.js native subpath imports `#src/*` (e.g., `import connectDB from '#src/config/db.js'`), eliminating complex relative path traversals.

---

## 5. Git & Collaboration Strategy

Refer to the complete branching, commit naming, and merge conflict resolution guides in [docs/git_strategy.md](file:///c:/Users/deepak/OneDrive/Desktop/zephyra/docs/git_strategy.md).

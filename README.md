# Limited-Stock Product Drop System <a name="readme-top"></a>

<div align="center"> <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /> <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /> <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /> <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" /> <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /> <img src="https://img.shields.io/badge/Prisma-3982CE?style-for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" /> <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
 <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" /> <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /> <h3><b>Limited-Stock Product Drop System</b></h3> <p>High-Concurrency Reservation System for Limited Edition Products</p> </div>
<!-- TABLE OF CONTENTS -->

<details>
  <summary>
    <h1>📗 Table of Contents</h1>
  </summary>

- [📖 About the Project](#about-project)
  - [🛠 Built With](#built-with)
    - [Tech Stack](#tech-stack)
    - [Key Features](#key-features)
- [💻 Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Install](#install)
  - [Environment Variables](#environment-variables)
  - [Usage](#usage)
  - [API Documentation](#api-documentation)
- [👥 Author](#author)
- [📈 Future Features](#future-features)
- [🤝 Contributing](#contributing)
- [⭐ Show your support](#support)
- [📝 License](#license)
</details>

<!-- PROJECT DESCRIPTION -->

# Limited-Stock Product Drop System <a name="about-project"></a>

**Limited-Stock Product Drop System** is a high-concurrency reservation system designed for flash sales and exclusive product releases. It handles scenarios where hundreds of users compete for limited inventory simultaneously, preventing overselling while maintaining fair access through a 5-minute reservation-based checkout mechanism.

## 🛠 Built With <a name="built-with"></a>

### Tech Stack <a name="tech-stack"></a>

<details> <summary> Frontend</summary> <ul> <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="react" width="45" height="45"/> React 19</li> <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="typescript" width="45" height="45"/> TypeScript</li> <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="tailwindcss" width="45" height="45"/> TailwindCSS</li> <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vite/vite-original.svg" alt="vite" width="45" height="45"/> Vite</li> <li>shadcn/ui</li> </ul> </details><details> <summary> Backend</summary> <ul> <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="nodejs" width="45" height="45"/> Node.js</li> <li><img
align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" alt="express" width="45" height="45"/> Express.js</li> <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="typescript" width="45" height="45"/> TypeScript</li> <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" alt="postgresql" width="45" height="45"/> PostgreSQL</li> <li><img align="center" src="https://raw.githubusercontent.com/devicons/devicon/master/icons/prisma/prisma-original.svg" alt="prisma" width="45" height="45"/> Prisma ORM</li> </ul> </details><details> <summary> Authentication & Security</summary> <ul> <li>🔐 JWT Authentication</li> <li>🔑 Bcrypt password hashing</li> <li>⏱️ Rate Limiting (express-rate-limit)</li> <li>🛡️ Helmet.js security headers</li> </ul> </details><details> <summary> Testing</summary> <ul> <li>🧪 Jest (Backend Testing)</li> <li>🔄 Cypress (E2E Testing)</li> <li>⚡ Vitest (Component Testing)</li> </ul> </details><details> <summary> Deployment</summary> <ul> <li>🐳 Docker & Docker Compose</li> <li>🚀 Render</li> <li>💾 Neon (Serverless PostgreSQL)</li> </ul> </details><!-- Features -->

<!-- Features -->

### Key Features <a name="key-features"></a>

#### User Features

- **User Authentication** - Register, login, and profile management with JWT authentication
- **Product Browsing** - Browse limited-stock products with real-time availability updates
- **Product Search** - Search products by name and description
- **Filtering & Sorting** - Sort products by price, name, stock availability, or newest arrivals
- **Reservation System** - 5-minute stock locking during checkout process
- **Real-time Countdown Timer** - Visual timer showing remaining reservation time with color-coded urgency (blue, orange, red)
- **Secure Checkout** - Convert active reservations to confirmed orders
- **Cancel Reservation** - Release reserved stock back to inventory
- **Dashboard** - View active reservations and order history

#### Technical Features

- **Race Condition Prevention** - Database transactions with row-level locking prevent overselling
- **Automatic Reservation Expiration** - Cron job runs every minute to expire stale reservations and restore stock
- **Complete Audit Trail** - InventoryLog table tracks every stock change with before/after states
- **Real-time Stock Updates** - Frontend polls product stock every 5 seconds
- **Rate Limiting** - API protection with different limits (100 req/15min global, 5 req/15min for auth)
- **JWT Authentication** - Stateless authentication with 7-day token expiration
- **Password Hashing** - bcrypt with 10 salt rounds for secure password storage
- **Input Validation** - Zod schemas for all API endpoints -**Error Handling** - Centralized error handler with proper HTTP status codes

#### Frontend Features

- **Responsive Design** - Mobile-first design with TailwindCSS and shadcn/ui components
- **Loading States** - Visual feedback during asynchronous operations
- **Error Handling** - User-friendly error messages for network failures, timeouts, and race conditions
- **Expiration Messaging** - Clear notification when reservation expires
- **Duplicate Prevention** - Prevents multiple rapid reservation attempts
- **Stock Indicators** - Visual progress bar and low stock warnings
- **Authentication Flow** - Sign up, sign in, and protected routes

#### Admin Features

- **Product Management** - Create, update, and delete products
- **Stock Management** - Adjust available stock quantities
- **Order Management** - View and manage all customer orders
- **System Monitoring** - Health check and metrics endpoints

<!-- ARCHITECTURE DEEP DIVE -->

## 🏗 Architecture Deep Dive <a name="architecture-deep-dive"></a>

### How Race Conditions Are Handled <a name="how-race-conditions-are-handled"></a>

Race conditions occur when multiple users attempt to reserve the last item simultaneously. The system prevents overselling through multiple layers:

**1. Database Transactions with Row-Level Locking**

```
async createReservation(userId: string, productId: string, quantity: number) {
return prisma.$transaction(async (tx) => {
// Row-level lock - prevents concurrent reads/writes
const product = await tx.product.findUnique({
where: { id: productId }
});
if (product.availableStock < quantity) {
throw new Error('Insufficient stock');
}

    // Stock decrement happens atomically
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { availableStock: { decrement: quantity } }
    });

    // Only proceeds if stock doesn't go negative
    if (updatedProduct.availableStock < 0) {
      throw new Error('Stock would become negative');
    }

    // Create reservation only after stock is secured
    return tx.reservation.create({ ... });

});
}
```

**2. Duplicate Prevention with Debouncing**

```
// Prevent rapid duplicate clicks (2-second window)
const isDuplicateAttempt = (productId: string): boolean => {
const lastAttempt = lastAttemptRef.current;
return lastAttempt?.productId === productId &&
Date.now() - lastAttempt.timestamp < 2000;
};
```

**3. Database-Level Constraints**

```
model Product {
  availableStock Int
  @@index([availableStock])
}

model Reservation {
  userId     String
  productId  String
  status     String   @default("ACTIVE")
  expiresAt  DateTime
  @@unique([userId, productId, status])
}
```

## Database Schema Decisions <a name="database-schema-decisions"></a>

Why Separate Reservation and Order Tables?

| Decision              | Rationale                                               |
| --------------------- | ------------------------------------------------------- |
| **Reservation Table** | Temporary stock locking with 5-minute TTL.              |
| **Order Table**       | Permanent record after successful checkout.             |
| **Separation**        | Allows reservation expiration without affecting orders. |

**Why InventoryLog Table?**

```
model InventoryLog {
  changeType String
  oldStock   Int
  newStock   Int
  reason     String
  metadata   Json?
}
```

Complete audit trail for debugging and dispute resolution. Every stock change is logged with before/after values.

## Indexing Strategy

```
@@index([userId])
@@index([productId])
@@index([status, expiresAt])
```

## Trade-offs <a name="trade-offs"></a>

| Trade-off                       | Choice                 | Why                                           |
| ------------------------------- | ---------------------- | --------------------------------------------- |
| Consistency vs Performance      | Consistency            | In limited drops, overselling is unacceptable |
| Real-time vs Efficiency         | Real-time              | Frontend polls every 5 seconds for simplicity |
| 5-minute vs Flexible Expiration | Configurable 5 minutes | Default balances UX with inventory turnover   |
| PostgreSQL vs Redis             | PostgreSQL             | Simpler architecture, one less dependency     |
| Node-cron vs External Scheduler | Node-cron              | Simpler deployment on Render                  |
| JWT vs Session                  | JWT                    | Stateless, scales horizontally                |

<p align="right">(<a href="#readme-top">back to top</a>)</p><!-- PERFORMANCE & SCALING -->

## Performance & Scaling <a name="performance-scaling"></a>

### What Breaks at 10,000 Concurrent Users <a name="what-breaks-at-10000-concurrent-users"></a>

| Component                | Current Limit       | At 10k Users          | Symptoms                     |
| ------------------------ | ------------------- | --------------------- | ---------------------------- |
| Database Connection Pool | 10-20 connections   | Connection exhaustion | Timeouts, connection refused |
| Row Lock Contention      | Product-level locks | Lock contention       | Slow responses, deadlocks    |
| Node.js Event Loop       | Single-threaded     | Event loop blocking   | Increased latency, timeouts  |
| Write Throughput         | Single primary      | Write bottleneck      | Slow transaction commits     |
| Memory Usage             | Per-request data    | Memory exhaustion     | OOM kills, swapping          |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Scaling Strategy <a name="scaling-strategy"></a>

Phase 1: Immediate Fixes (1k-2k users)

```
DATABASE_URL="postgresql://...?connection_limit=50"
# Add PgBouncer connection pooling
```

Phase 2: Horizontal Scaling (2k-5k users)

```
services:
  - type: web
    name: dropzone-backend
    numReplicas: 5
```

Phase 3: Read Replicas (5k-10k users)

```
# Products endpoint uses read replica
# Reservations/checkout use primary
```

## Phase 4: Advanced Scaling (10k+ users)

- [] Redis for reservation state
- [] Queue system for checkout processing
- [] Database sharding by product ID
- [] CDN for static assets
- [] Stricter per-user rate limiting

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## 💻 Getting Started <a name="getting-started"></a>

To get a local copy up and running, follow these steps.

### Prerequisites

In order to run this project you need:

- Node.js (v18 or higher)
- PostgreSQL installed locally or Neon account (free)
- Docker (optional, for containerized development)s

### Setup

Clone the repository:

```bash
git clone https://github.com/haftamudesta/mcp_internship_task
cd mpc_internship_task
```

- [ ] Open the file in your code editor

```
code .
```

### Install dependencies:

## Install backend and frontend dependencies (for development):

- [ ] Install backend dependencies:

```
cd backend
npm install
```

- [ ] Install frontend dependencies:

```
cd frontend
npm install
```

### Environment Variables

- [ ] Create a .env file in the backend directory:

```
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/your_databasename"

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Reservation
RESERVATION_EXPIRATION_MINUTES=5

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

- [ ] Create a .env file in the frontend directory:

```
VITE_API_URL=http://localhost:3001
```

### Database Setup

```
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### Usage

Start the backend server:

```

cd backend
npm run dev

```

Start the frontend development server:

```

cd frontend
npm run dev

```

```

Open your browser and visit http://localhost:3000

```

### Running Tests

```
# Backend tests
cd backend
npm test

# Frontend E2E tests
cd frontend
npm run test:e2e

# Frontend component tests
cd frontend
npx cypress run --component
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AUTHORS -->

## 👥 Author <a name="author"></a>

👤 **Haftamu Desta**

- GitHub: [@haftamu](https://github.com/haftamudesta)
- Twitter: [@DestaHaftamu](https://twitter.com/DestaHftamu?t=NQ4ovkdWbsfsjh62NFEXFg&s=09)
- LinkedIn: [Haftamu Desta](https://www.linkedin.com/in/haftamu-desta-795791a1/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FUTURE FEATURES -->

## 📈 Future Features <a name="future-features"></a>

- [ ] **Stripe Payment Integration** for Secure online payment processing for checkout
- [ ] **WebSocket connections** for real-time updates
- [ ] **Redis caching** for product queries
- [ ] **Queue system** for checkout processing
- [ ] **Admin dashboard** for inventory management
- [ ] **Waiting room** for fair distribution
- [ ] **Analytics dashboard** for drop performance
- [ ] **Email notifications** for reservation confirmation and expiration reminders

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing <a name="contributing"></a>

Contributions, issues, and feature requests are welcome!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SUPPORT -->

## Show your support <a name="support"></a>

If you like this project then don't forget to give a star ⭐ on this repository.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License <a name="license"></a>

This project is [MIT](./LICENSE) licensed.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

| Real-time vs Efficiency | Real-time | Frontend polls every 5 seconds for simplicity |

| 5-minute vs Flexible Expiration | Configurable 5 minutes | Default balances UX with inventory turnover |

| PostgreSQL vs Redis | PostgreSQL | Simpler architecture, one less dependency |

| Node-cron vs External Scheduler | Node-cron | Simpler deployment on Render |

| JWT vs Session | JWT | Stateless, scales horizontally |

"scripts": {
"dev": "nodemon src/server.ts",
"build": "tsc",
"start": "node dist/index.js",
"prisma:generate": "prisma generate",
"prisma:migrate": "prisma migrate dev",
"prisma:studio": "prisma studio",
"prisma:reset": "prisma migrate reset",
"clean": "rm -rf dist",
"build:clean": "npm run clean && npm run build",
"populate:products": "ts-node src/populateProducts.ts",
"docker:build": "docker build -t dropzone-backend .",
"docker:run": "docker run -p 3001:3001 dropzone-backend",
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"test:concurrency": "jest --testNamePattern='Concurrency'"
},

# OrderIQ

**OrderIQ** is a full-stack food ordering platform that connects customers, restaurant owners, and administrators in real-time. Built with a modern React frontend and a Node.js/Express backend, it supports live order tracking via Socket.io, Firebase authentication, Cloudinary image uploads, a PostgreSQL database managed through Prisma, and an **AI-powered RAG Chat Assistant** for intelligent food recommendations.

---

## Architecture Overview

```
orderiq/
├── frontend/          # React (Vite) — Customer, Restaurant, Admin UIs
└── backend/           # Node.js (Express) — REST API + Socket.io server
```

### Tech Stack

| Layer               | Technology                                                   |
| ------------------- | ------------------------------------------------------------ |
| **Frontend**        | React 19, Vite, Tailwind CSS, Framer Motion, React Router v7 |
| **State / Context** | React Context API (Auth, Cart, Restaurant, Admin)            |
| **Real-time**       | Socket.io Client                                             |
| **Auth**            | Firebase Authentication                                      |
| **HTTP Client**     | Axios                                                        |
| **UI Extras**       | Lucide React, Headless UI, React Hot Toast                   |
| **Backend**         | Node.js, Express 5                                           |
| **Database**        | PostgreSQL (hosted on Supabase) via Prisma ORM + **pgvector** |
| **Auth (Server)**   | Firebase Admin SDK                                           |
| **Image Uploads**   | Cloudinary + Multer                                          |
| **Real-time**       | Socket.io                                                    |
| **AI / RAG**        | Ollama (local embeddings + LLM), Groq API (optional)         |
| **Embeddings**      | `nomic-embed-text` (768-dim vectors via Ollama)              |
| **LLM**             | Groq `llama-3.3-70b` (primary) / Ollama `gemma3:1b` (fallback) |
| **Vector Store**    | pgvector (inside existing PostgreSQL)                        |
| **Security**        | Helmet, express-rate-limit, CORS                             |
| **Logging**         | Morgan                                                       |
| **Email**           | Nodemailer                                                   |

---

## Features

### Customer
- Browse restaurants by cuisine, area, and service type
- Real-time restaurant details and menu browsing
- Scan QR codes at restaurant tables to instantly access digital menus
- Cart management with Delivery, Pickup, and localized Dine-in table mapping
- Live order tracking with Socket.io
- Saved addresses, favorites, rewards points, and referral codes
- Firebase-authenticated profile and settings

### Restaurant Owner
- Secure restaurant dashboard (protected route)
- Live orders panel with real-time status updates
- Full menu management (categories + items, images via Cloudinary)
- **QR Code Management**: Dynamically generate, manage, and print QR codes mapped to physical tables
- Availability toggling and working hours
- Team management (invite staff / managers)
- Order history and analytics

### Admin
- Admin-only protected dashboard
- Manage all users, restaurants, orders, and campaigns
- Platform-wide settings

### QR Code Dine-in System 📸
- **For Owners**: Create and customize unique QR codes for specific tables from the dashboard.
- **For Customers**: Scanning the table's QR code routes directly to a specialized dining interface (`/menu/:restaurantId`).
- **Seamless Ordering**: The order type automatically defaults to `DINEIN` and attaches the specific table number, bypassing the delivery fee logic and notifying the kitchen of the exact table locaton.

### AI Chat Assistant (RAG)
- Floating chat widget available on all pages
- Intelligent food and restaurant recommendations powered by RAG
- Semantic search — understands queries like "suggest a good burger place" or "what biryani options are available"
- Real-time knowledge base — auto-syncs when restaurants or menus are updated
- Markdown-formatted responses with ratings, locations, prices, and cuisine info
- Groq API (70B model) for high-quality responses, with local Ollama fallback

---

## Database Schema (Prisma)

Models: `User` · `Restaurant` · `Category` · `MenuItem` · `Order` · `OrderItem` · `Address` · `TeamMember` · `Reward` · `Favorite`

Key enums: `Role` · `OrderStatus` · `OrderType` · `PaymentMethod` · `RestaurantStatus`

> See [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma) for the full schema.

---

## RAG Pipeline (AI Chat Assistant)

### How It Works

```
User asks: "Suggest me a good burger place in Lahore"
     │
     ▼
  1. Embed query → Ollama (nomic-embed-text) converts text to 768-dim vector
     │
     ▼
  2. Vector search → pgvector finds top 8 most similar restaurants/items
     │
     ▼
  3. Build prompt → System rules + retrieved data + conversation history + question
     │
     ▼
  4. LLM generates → Groq API (or Ollama fallback) answers using ONLY retrieved data
     │
     ▼
  5. Response → Formatted markdown sent to frontend chat widget
```

### Knowledge Base Auto-Sync

When a restaurant or menu item is created/updated, the embedding is automatically regenerated and stored in pgvector. No manual re-indexing needed.

### RAG Module Structure

```
backend/rag/
├── config.js                    # LLM, embedding, and prompt configuration
├── index.js                     # Module entry point
├── controllers/
│   └── chatController.js        # /api/chat endpoints
├── routes/
│   └── chatRoutes.js            # Express router
├── services/
│   ├── embeddingService.js      # Text → vector via Ollama
│   ├── llmService.js            # Groq (primary) + Ollama (fallback)
│   ├── vectorStoreService.js    # pgvector table, HNSW index, similarity search
│   ├── ragPipeline.js           # Full RAG orchestration
│   └── syncService.js           # Auto-sync embeddings on data changes
└── scripts/
    ├── seedData.js              # Seed sample restaurants + menu items
    └── syncEmbeddings.js        # Generate embeddings for all existing data
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) PostgreSQL project (or any PostgreSQL instance with pgvector)
- A [Firebase](https://firebase.google.com) project (Auth enabled)
- A [Cloudinary](https://cloudinary.com) account
- [Ollama](https://ollama.com/download) installed (for AI Chat Assistant)

---

### 1. Ollama Setup (AI Chat)

```bash
# Install Ollama from https://ollama.com/download, then:
ollama pull nomic-embed-text    # Embedding model (~274 MB)
ollama pull gemma3:1b           # Local LLM fallback (~815 MB)
```

> **Important:** Ollama must be running before starting the backend. Open the Ollama app (macOS) or run `ollama serve`.

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5001

# PostgreSQL — Supabase connection pooler URL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/postgres"

# Firebase Admin SDK
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# RAG / AI Chat Assistant
GROQ_API_KEY="your-groq-api-key"          # Free at https://console.groq.com
OLLAMA_BASE_URL="http://localhost:11434"
```

Push the database schema:

```bash
npx prisma db push
```

Seed sample restaurant data and generate embeddings (for RAG):

```bash
node rag/scripts/seedData.js         # Seeds 10 restaurants + 49 menu items
node rag/scripts/syncEmbeddings.js   # Generates vector embeddings (requires Ollama)
```

Start the backend:

```bash
npm run dev      # development (nodemon)
npm start        # production
```

The API will be available at `http://localhost:5001`.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001

# Firebase Web SDK
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints (Overview)

| Prefix             | Description                                       |
| ------------------ | ------------------------------------------------- |
| `GET /api/health`  | Server health check                               |
| `/api/auth`        | Registration, login, profile (`/me`)              |
| `/api/restaurants` | List, create, update restaurants and menu         |
| `/api/orders`      | Place, track, and manage orders                   |
| `/api/users`       | User profile, addresses, favorites, rewards       |
| `/api/admin`       | Admin-only: users, restaurants, orders, campaigns |
| `/api/upload`      | Image upload to Cloudinary                        |
| `/api/chat`        | AI Chat Assistant (RAG) — see below               |

### Chat API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message, get AI response |
| `POST` | `/api/chat/stream` | Stream response via Server-Sent Events |
| `GET`  | `/api/chat/status` | Check RAG system health (embedding count, Ollama status) |

**Request body** (`POST /api/chat`):
```json
{
  "message": "Suggest me a good burger place in Lahore",
  "conversationHistory": [],
  "userContext": { "city": "Lahore" }
}
```

---

## Real-time Events (Socket.io)

| Event                 | Direction           | Description                           |
| --------------------- | ------------------- | ------------------------------------- |
| `join_restaurant`     | Client → Server     | Join a restaurant's notification room |
| `join_order`          | Client → Server     | Join an order tracking room           |
| `new_order`           | Server → Restaurant | Notify restaurant of a new order      |
| `order_status_update` | Server → Customer   | Broadcast order status change         |

---

## Project Structure

```
frontend/src/
├── components/         # Reusable UI components
│   ├── auth/           # Login modal, protected routes
│   ├── chat/           # ChatAssistant (AI chat widget)
│   ├── customer/       # DishCard, RestaurantCard
│   ├── layout/         # Navbar, Footer, CustomerLayout, DashboardSidebar
│   ├── sections/       # Landing page sections (Hero, CTA, Features, etc.)
│   └── ui/             # Button, Card, Drawer primitives
├── features/           # React Context providers
│   ├── auth/           # AuthContext (Firebase)
│   ├── customer/       # CartContext
│   ├── restaurant/     # RestaurantContext
│   └── admin/          # AdminAuthContext, AdminFiltersContext
├── layouts/            # AdminLayout, RestaurantLayout (with sidebar)
├── pages/              # Route-level page components
│   ├── LandingPage/
│   ├── auth/           # RoleSelection, CustomerSignup, RestaurantSignup
│   ├── customer/       # Home, RestaurantDetails, CartPage, OrderTracking, Profile, ...
│   ├── restaurant/     # Dashboard, LiveOrders, MenuManagement, Analytics, ...
│   └── admin/          # Dashboard, Users, Restaurants, Orders, Campaigns, Settings
├── services/           # Axios service modules per domain (incl. chat.service.js)
└── config/             # Firebase web config

backend/
├── config/             # db.js (Prisma client), firebase.js (Admin SDK)
├── controllers/        # Business logic per domain
├── middleware/         # auth.js (Firebase token verify), upload.js (multer)
├── prisma/             # schema.prisma
├── rag/                # RAG AI Chat Assistant module
│   ├── config.js       # LLM, embedding, prompt settings
│   ├── index.js        # Module entry point
│   ├── controllers/    # chatController.js
│   ├── routes/         # chatRoutes.js
│   ├── services/       # embeddingService, llmService, vectorStoreService, ragPipeline, syncService
│   └── scripts/        # seedData.js, syncEmbeddings.js
├── routes/             # Express routers
├── scripts/            # createAdmin.js (seed admin user)
├── uploads/            # Runtime image uploads (gitignored)
└── server.js           # Entry point
```

---

## Creating an Admin User

There is no admin registration UI. Use the seed script:

```bash
cd backend
node scripts/createAdmin.js
```

Then log in at `/admin` with the credentials set in the script.

---

## Startup Order

```
1. Open Ollama app         ← Must be running first (for AI Chat)
2. npm run dev (backend)   ← Starts on port 5001
3. npm run dev (frontend)  ← Starts on port 5173
```

> **Ollama must be running before the backend.** The RAG pipeline depends on it for embeddings and LLM inference. If Ollama isn't running, chat requests will fail with "Failed to process your message."

---

## Build for Production

```bash
# Frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend — no build step required, deploy server.js directly
```

---

## Mutation Testing

This section documents the mutation testing work completed as part of CS-4006 (Software Testing) at FAST NUCES, Spring 2025. The goal was to evaluate the fault-finding capability of the test suite using Stryker, the industry-standard mutation testing tool for JavaScript.

### Target Module

`backend/controllers/orderController.js` — the core business logic layer handling order creation, order retrieval with role-based filtering, status updates, and access control.

### Tool

- **Mutation Testing:** Stryker (`@stryker-mutator/core` + `@stryker-mutator/jest-runner`)
- **Test Runner:** Jest
- **Coverage:** Jest built-in coverage (`--coverage`)

### Results Summary

| Metric | Baseline (Task 2) | After Improvement (Task 4) |
|---|---|---|
| Mutation Score | 42.41% | 58.75% |
| Mutants Killed | 109 / 257 | 151 / 257 |
| Mutants Survived | 115 | 96 |
| Line Coverage | 84.50% | 84.50% |
| Tests | 25 | 34 |

### How to Reproduce

```bash
# 1. Install backend dependencies
cd backend && npm install

# 2. Confirm all tests pass (required before any mutation run)
npm test

# 3. Generate the coverage report (Task 1)
npm run test:coverage
# HTML report: reports/baseline_coverage/index.html

# 4. Run the baseline mutation testing (Task 2)
#    Ensure stryker.config.mjs htmlReporter.baseDir is set to '../reports/mutation_baseline'
npx stryker run
# HTML report: reports/mutation_baseline/index.html

# 5. Run the final mutation testing after new tests are added (Task 4)
#    Update stryker.config.mjs htmlReporter.baseDir to '../reports/mutation_final'
npx stryker run
# HTML report: reports/mutation_final/index.html
```

### Repository Structure for This Assignment

```
reports/
  baseline_coverage/   <- Task 1: Jest coverage HTML report
  mutation_baseline/   <- Task 2: Stryker run before new tests
  mutation_final/      <- Task 4: Stryker run after new tests

backend/
  tests/
    orderController.test.js   <- all 31 tests (25 baseline + 6 killing tests)
  stryker.config.mjs          <- Stryker configuration
```

The branch `mutation-testing-assignment` contains all test files, Stryker configuration, and HTML reports. The PDF report (`FYP-MutationTesting-Report.pdf`) covers all four assignment tasks with full mutant analysis.

---

## License

MIT — feel free to fork and build on this project.

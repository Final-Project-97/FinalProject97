# RAC (Recommendation Auto Car) AI

> An intelligent, mobile-first Web application that empowers prospective car buyers to find their ideal vehicle using AI recommendations, explore 360° interactive views, simulate auto loans, locate nearby showrooms, and subscribe to premium AI quotas via Midtrans.

---

## Table of Contents
1. [Overview & Features](#-overview--features)
2. [Tech Stack](#-tech-stack)
3. [Architecture & Data Flow](#-architecture--data-flow)
4. [Project Structure](#-project-structure)
5. [Prerequisites](#-prerequisites)
6. [Step-by-Step Setup Guide](#-step-by-step-setup-guide)
   - [1. Clone Repository](#1-clone-repository)
   - [2. Backend Setup & Configuration](#2-backend-setup--configuration)
   - [3. Database Indexing & Data Seeding](#3-database-indexing--data-seeding)
   - [4. Frontend Setup & Configuration](#4-frontend-setup--configuration)
7. [Running the Application](#-running-the-application)
8. [Testing & Verification](#-testing--verification)
9. [API Documentation Reference](#-api-documentation-reference)
10. [Subscription & Token Lifecycle](#-subscription--token-lifecycle)
11. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## Overview & Features

RAC AI bridges the gap between car discovery and showroom visits by delivering:

- **AI-Powered Recommendation Engine**: Tailored vehicle suggestions based on user budget, family size, driving priorities (fuel efficiency, performance, luxury), and color preferences.
- **Interactive 360° Car Viewer (CI360)**: High-resolution exterior rotation for hero featured cars.
- **Dynamic Color Selector**: Real-time vehicle image swap with availability indicators (`available`, `limited`, `out`).
- **Context-Aware AI Chatbot**: Interactive car consultation assistant powered by Groq & LangChain.
- **AI-Assisted Credit Simulation**: Monthly installment and down payment calculator factoring in interest rates and tenure.
- **Showroom Locator**: Real-time geolocation matching with Google Places API integration and offline JSON seed fallback.
- **Wishlist Management**: Save, note, and manage curated cars linked to AI recommendation scores.
- **Dual Authentication**: Secure registration/login with email & bcrypt password or one-tap Google OAuth 2.0.
- **Freemium & SaaS Monetization**: Free tier with 5 AI usage tokens, seamlessly upgradable to monthly unlimited AI access via Midtrans Payment Gateway.

---

## Tech Stack

### Frontend
- **Framework**: React 19 (SPA via Vite)
- **Styling**: Tailwind CSS v4 & DaisyUI v5
- **Routing**: React Router v8
- **360° Viewer**: Cloudimage-360-View (CI360)
- **Alerts & Toasts**: React-Toastify & SweetAlert2
- **Icons**: React Icons

### Backend
- **Runtime & Framework**: Node.js (ES Modules, `>=20`), Express.js 5
- **Database & ORM**: MongoDB Atlas / Local, Mongoloquent ORM
- **Authentication**: JSON Web Tokens (JWT), Bcrypt, Google Auth Library
- **AI & LLM**: Groq Cloud SDK (`@langchain/groq`), LangChain
- **Payment Gateway**: Midtrans Snap API (Sandbox & Production ready)
- **Validation**: Zod Schemas
- **External Services**: Google Places API, CarAPI.app Sync
- **Scheduled Jobs**: Node-Cron (Subscription expiry management)

---

## Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client (React 19 SPA)                         │
│   • 360° Viewer  • AI Rec Form  • Loan Calculator  • Showroom Map/List  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / REST / JWT
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Backend API (Express 5)                          │
│   ┌──────────────┬──────────────┬──────────────┬──────────────────┐     │
│   │ Auth Routes  │  Cars API    │  AI Engine   │  Wishlist API    │     │
│   └──────────────┴──────────────┴──────────────┴──────────────────┘     │
│   ┌─────────────────────────────┬─────────────────────────────────┐     │
│   │ Showrooms (Places/Seed)     │ Midtrans Subscription & Webhook │     │
│   └─────────────────────────────┴─────────────────────────────────┘     │
└──────────────┬─────────────────────────────┬────────────────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────────┐ ┌────────────────────────────────────────┐
│      MongoDB Database        │ │           External Services            │
│ • users       • cars         │ │ • Groq LLM (LangChain)                 │
│ • wishlists   • subscriptions│ │ • Midtrans Snap Payment Gateway        │
│ • ai_usage_logs              │ │ • Google Places API & Google OAuth     │
└──────────────────────────────┘ └────────────────────────────────────────┘
```

---

## Project Structure

```text
FinalProject97/
├── backend/                    # Express.js REST API
│   ├── config/                 # Static data & seed configs
│   │   ├── car-enrichment.json # Local car catalog dataset with specs & images
│   │   └── showrooms.seed.json # Fallback showroom coordinates & details
│   ├── scripts/                # Utility & maintenance scripts
│   │   ├── create-indexes.js   # MongoDB index initializer
│   │   ├── sync-cars.js        # Car catalog seeder
│   │   ├── run-expiry-cron.js  # Subscription expiration background worker
│   │   └── integration.js      # Automated backend integration test suite
│   ├── src/                    # Backend application source code
│   │   ├── ai/                 # LangChain & Groq AI handlers
│   │   ├── auth/               # Authentication controllers, routes & middleware
│   │   ├── config/             # DB connection & environment helpers
│   │   ├── controllers/        # Express route controllers (Car, AI, etc.)
│   │   ├── middlewares/        # Auth verification & AI token gate middleware
│   │   ├── models/             # Mongoloquent MongoDB models
│   │   ├── routes/             # Express route definitions
│   │   ├── showrooms/          # Google Places & seed showroom handlers
│   │   ├── subscription/       # Midtrans payment checkout & webhook listener
│   │   ├── wishlist/           # User wishlist CRUD operations
│   │   ├── app.js              # Express app configuration & middleware mounts
│   │   └── index.js            # Server entry point
│   ├── .env.example            # Backend environment variables template
│   └── package.json            # Backend dependencies and scripts
│
├── frontend/                   # React + Vite Client Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios/Fetch API client wrappers
│   │   ├── assets/             # Images, logos, and illustrations
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Modal, etc.)
│   │   ├── context/            # Global React Contexts (Auth, AI, Session)
│   │   ├── layout/             # Master page layouts
│   │   ├── views/              # Page views (Home, Detail, Login, Wishlist, etc.)
│   │   ├── App.jsx             # Root routing and context provider setup
│   │   ├── index.css           # Tailwind CSS directives and custom styling
│   │   └── main.jsx            # React DOM client entry point
│   ├── .env.example            # Frontend environment variables template
│   └── package.json            # Frontend dependencies and scripts
│
├── ERD.md                      # Detailed Entity Relationship Documentation
├── PRD.md                      # Product Requirements Document
└── README.md                   # Project documentation
```

---

## Prerequisites

Before running the application, make sure you have the following installed:

- **Node.js**: Version `20.x` or higher ([Download Node.js](https://nodejs.org/))
- **NPM**: Version `9.x` or higher (Bundled with Node.js)
- **MongoDB**: A running local MongoDB instance or a free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas/database)
- **Git**: For version control

### Required Third-Party API Keys:
1. **Groq Cloud API Key**: For AI recommendations & chat ([Get Groq API Key](https://console.groq.com/))
2. **Midtrans Sandbox Account**: Server Key & Client Key for payment gateway ([Sign up Midtrans Sandbox](https://dashboard.sandbox.midtrans.com/))
3. **Google OAuth Client ID**: For Google Sign-in ([Google Cloud Console](https://console.cloud.google.com/))
4. **Google Places API Key** *(Optional)*: For live showroom discovery

---

## Step-by-Step Setup Guide

### 1. Clone Repository

```bash
# Clone the repository to your local machine
git clone https://github.com/your-username/FinalProject97.git

# Navigate into the project root directory
cd FinalProject97
```

---

### 2. Backend Setup & Configuration

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file from `.env.example`:
   ```bash
   # On Windows PowerShell:
   copy .env.example .env

   # On macOS / Linux:
   cp .env.example .env
   ```

4. **Fill in the `.env` values:**
   Open `backend/.env` in your code editor and update the following settings:

   ```ini
   # ─── Server Configuration ───
   PORT=5001

   # ─── MongoDB Database ───
   # Use local URI (e.g., mongodb://localhost:27017) or MongoDB Atlas connection string
   MONGODB_URI=mongodb+srv://<USER>:<PASSWORD>@cluster.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=rac-ai

   # ─── Authentication ───
   # Generate a secure 32+ character string for signing JWT tokens
   JWT_SECRET=super_secret_jwt_token_change_in_production_32chars

   # ─── Google Authentication & APIs ───
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

   # ─── AI Service (Groq) ───
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_MODEL=openai/gpt-oss-120b

   # ─── Midtrans Payment Gateway (Sandbox) ───
   MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
   MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
   MIDTRANS_IS_PRODUCTION=false
   PREMIUM_MONTHLY_PRICE=99000

   # ─── CORS Settings ───
   CORS_ORIGIN=http://localhost:5173
   ```

---

### 3. Database Indexing & Data Seeding

Ensure your MongoDB connection string in `.env` is valid before running these scripts.

1. **Create Database Indexes:**
   Initializes unique constraints and search indexes for users, cars, wishlists, and subscriptions:
   ```bash
   npm run indexes
   ```

2. **Seed the Car Catalog:**
   Populates MongoDB with curated car models, specifications, 360° asset URLs, and color variants from `config/car-enrichment.json`:
   ```bash
   npm run seed:cars
   ```

---

### 4. Frontend Setup & Configuration

1. **Open a new terminal window and navigate to the frontend directory:**
   ```bash
   cd ../frontend
   # Or from root: cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file from `.env.example`:
   ```bash
   # On Windows PowerShell:
   copy .env.example .env

   # On macOS / Linux:
   cp .env.example .env
   ```

4. **Fill in the frontend `.env` values:**
   ```ini
   # Backend API base URL
   VITE_API_URL=http://localhost:5001

   # Toggle mock mode (set to false to connect with live backend)
   VITE_USE_MOCK=false

   # Google OAuth Client ID (must match backend GOOGLE_CLIENT_ID)
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

   # Midtrans Client Key for Snap Pop-up Payment Modal
   VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
   ```

---

## Running the Application

### Start the Backend Server

In your **`backend`** terminal:
```bash
# Start backend in development mode with nodemon auto-reload
npm run dev
```
> Backend server will be accessible at: `http://localhost:5001`
> Health check endpoint: `http://localhost:5001/health`

### Start the Frontend Client

In your **`frontend`** terminal:
```bash
# Start Vite development server
npm run dev
```
> Frontend application will be live at: `http://localhost:5173`

---

## Testing & Verification

### Backend Automated Tests
From the `backend` directory:

```bash
# Run unit & endpoint tests using Jest
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run end-to-end integration test suite
npm run test:integration
```

### Manual Verification Checklist
1. **Health Check**: Open `http://localhost:5001/health` in your browser. Expected response: `{"status": "SUCCESS", ...}`.
2. **User Registration & Login**: Test standard email/password registration and Google Sign-in.
3. **AI Recommendation**: Submit the recommendation form on the homepage and check if 1 token is deducted.
4. **Interactive 360° Viewer**: Rotate the hero car on the homepage.
5. **Color Switcher**: Open a car detail page and click different color swatches to verify image swapping.
6. **Wishlist**: Add a car to your wishlist and verify it shows on `/wishlist`.
7. **Midtrans Checkout**: Upgrade to Premium and complete test payment on the Midtrans Sandbox simulator.

---

## API Documentation Reference

All API routes are prefixed with `/api`.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | ❌ No | Register new user with email & password |
| `POST` | `/api/auth/login` | ❌ No | Log in with email & password (returns JWT) |
| `POST` | `/api/auth/google` | ❌ No | Authenticate using Google OAuth ID Token |
| `GET` | `/api/auth/me` | ✅ Yes | Retrieve logged-in user profile & AI token count |
| `POST` | `/api/auth/logout` | ❌ No | Log out current session |

### 2. Car Catalog (`/api/cars`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/cars` | ❌ No | Get list of all cars with filtering & pagination |
| `GET` | `/api/cars/top` | ❌ No | Get the featured top product car for 360° banner |
| `GET` | `/api/cars/:id` | ❌ No | Get detailed car specifications by ID or slug |

### 3. AI Features (`/api/ai`)
> *Requires active JWT authentication and available AI tokens or active Premium subscription.*

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/ai/recommend` | ✅ Yes | Generate car recommendations based on budget & criteria |
| `POST` | `/api/ai/chat` | ✅ Yes | Send message to context-aware car assistant |
| `POST` | `/api/ai/credit-simulate`| ✅ Yes | AI-assisted auto loan calculation and financial insight |

### 4. Wishlist (`/api/wishlist`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/wishlist` | ✅ Yes | List all cars saved in user wishlist |
| `POST` | `/api/wishlist` | ✅ Yes | Add a car with color preference & notes to wishlist |
| `PUT` | `/api/wishlist/:id` | ✅ Yes | Update saved wishlist item notes or color |
| `DELETE` | `/api/wishlist/:id` | ✅ Yes | Remove an item from wishlist |

### 5. Showrooms (`/api/showrooms`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/showrooms/nearby` | ❌ No | Fetch nearby showrooms (Google Places API / fallback seed) |

### 6. Subscription & Payment (`/api/subscription`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/subscription/status` | ✅ Yes | Check current subscription expiry and status |
| `POST` | `/api/subscription/checkout`| ✅ Yes | Create Midtrans Snap transaction token |
| `POST` | `/api/subscription/webhook` | ❌ No (Public) | Midtrans HTTP notification webhook endpoint |

---

## Subscription & Token Lifecycle

```
┌─────────────┐     5x AI used      ┌──────────────┐
│  FREE tier  │ ──────────────────► │ Token empty  │
│  aiTokens=5 │                     │  aiTokens=0  │
└─────────────┘                     └──────┬───────┘
                                           │
                               Midtrans payment (monthly)
                                           ▼
                                    ┌──────────────┐
                                    │   PREMIUM    │
                                    │ 30 days active
                                    │ AI unlimited │
                                    └──────┬───────┘
                                           │
                                    expiresAt passed
                                           ▼
                                    ┌──────────────┐
                                    │   EXPIRED    │
                                    │  AI blocked  │
                                    │ tokens = 0   │
                                    └──────┬───────┘
                                           │
                                 Renew via Midtrans
                                           ▼
                                    ┌──────────────┐
                                    │   PREMIUM    │
                                    │ +30 new days │
                                    └──────────────┘
```

- **Free Tier**: Every registered user starts with **5 free AI tokens**. Each AI recommendation, chat message, or AI credit simulation consumes **1 token**.
- **Premium Tier**: Purchasing a monthly pass extends `expiresAt` by **30 days** and provides **unlimited AI access**.
- **Background Expiry Cron**: Run `npm run expiry:cron` to automatically check expired plans and update user statuses.

---

## Troubleshooting & FAQ

#### 1. CORS Error when fetching API
- **Cause**: Frontend URL does not match `CORS_ORIGIN` in `backend/.env`.
- **Solution**: Ensure `CORS_ORIGIN=http://localhost:5173` matches your frontend development port.

#### 2. `403 TOKEN_EXHAUSTED` Error on AI Requests
- **Cause**: Free tier user has exhausted all 5 tokens and has no active subscription.
- **Solution**: Navigate to `/upgrade` to purchase a monthly subscription, or manually reset `aiTokensRemaining` in MongoDB for local testing.

#### 3. 360° Car Image is Not Rotating
- **Cause**: CDN script from Cloudimage-360-View failed to initialize or image URL structure is invalid.
- **Solution**: Check browser console network tab and verify `image360Url` format in `config/car-enrichment.json`.

#### 4. Midtrans Snap Modal Does Not Open
- **Cause**: `VITE_MIDTRANS_CLIENT_KEY` is missing in frontend `.env` or `MIDTRANS_SERVER_KEY` is incorrect in backend `.env`.
- **Solution**: Double check both keys from your Midtrans Sandbox Dashboard under **Settings > Access Keys**.

---

## Contributors & Acknowledgements

Developed as a Final Project for **Hacktiv8 Fullstack Web Development Bootcamp**.

- **Team**: RAC
- **Platform**: Web SPA (Mobile-first)
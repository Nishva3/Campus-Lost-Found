# Campus Lost & Found Portal

A full-stack, microservices-based web application that helps university students and staff report, search, and reclaim lost items on campus.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)

---

## Overview

The Campus Lost & Found Portal solves a real problem on university campuses — the lack of a centralized, digital system for reporting and recovering lost belongings. Students can post lost or found items with photos, descriptions, and location details. When a found item is reported, all registered users are instantly alerted via SMS and email. A built-in claims workflow lets finders approve or reject ownership requests, giving the process structure and accountability.

---

## Features

- **Report items** as lost or found with title, description, category, location, date, image, and tags
- **Browse and search** the full item catalogue with filters for type, category, location, and date range
- **Autocomplete search** powered by a dedicated search service
- **Submit claims** on found items with a written ownership justification
- **Track claims** and view approval or rejection status in real time
- **In-app notifications** for every key action — item posted, claim received, claim approved or rejected
- **My Items** page to manage your own reports
- **Graceful fallback** — runs in mock mode if no Twilio or SMTP credentials are configured, logging to console instead
- **JWT authentication** with role-based access control
- **Event-driven architecture** using Apache ActiveMQ (STOMP) for decoupled, async communication between services
- **Polyglot persistence** — PostgreSQL for structured relational data (users, claims) and MongoDB for flexible document data (items, notifications)

---

## Architecture

The application is composed of 7 independently deployable services, all orchestrated via Docker Compose:

```
+--------------+
|   Frontend   |  React + Redux Toolkit + Redux-Saga
|  (port 3000) |
+------+-------+
       | HTTP
+------v-------+
|  API Gateway |  Express reverse proxy  (port 4000)
+--+--+--+-----+
   |  |  |  +------------------------------------------+
   |  |  |                                              |
+--v-+ +v------+ +--------+ +--------------+ +----------v---+
|Auth| | Item  | | Claim  | |Notification  | |   Search     |
|Svc | |  Svc  | |  Svc   | |    Svc       | |    Svc       |
|3001| |  3002 | |  3003  | |   3004       | |   3005       |
+--+-+ +--+----+ +---+----+ +------+-------+ +------+-------+
   |      |          |             |                 |
   |   +--v----------v-------------v-----------------v--+
   |   |            Apache ActiveMQ (STOMP)              |
   |   |         /queue/item.created                     |
   |   |         /queue/claim.submitted                  |
   |   |         /queue/claim.updated                    |
   +---+--------------------------------------------------+
   |                    |
+--v--------+    +------v------+
| PostgreSQL|    |   MongoDB   |
| (users,   |    | (items,     |
|  claims)  |    |  notifs)    |
+-----------+    +-------------+
```

**ActiveMQ message queues:**

| Queue | Published by | Consumed by |
|---|---|---|
| `item.created` | Item Service | Notification Service |
| `claim.submitted` | Claim Service | Notification Service |
| `claim.updated` | Claim Service | Item Service, Notification Service |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Redux Toolkit, Redux-Saga, React Router |
| **API Gateway** | Node.js, Express, http-proxy-middleware |
| **Auth Service** | Node.js, Express, PostgreSQL, bcryptjs, JWT |
| **Item Service** | Node.js, Express, MongoDB (Mongoose), stompit |
| **Claim Service** | Node.js, Express, PostgreSQL, stompit, Axios |
| **Notification Service** | Node.js, Express, MongoDB |
| **Search Service** | Node.js, Express, MongoDB (regex full-text search) |
| **Message Broker** | Apache ActiveMQ (STOMP protocol) |
| **Databases** | PostgreSQL 15, MongoDB |
| **Containerization** | Docker, Docker Compose |

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/campus-lost-found.git
cd campus-lost-found

# 2. (Optional) Configure real email/SMS credentials
cp .env.example .env
# Edit .env with your Twilio and Gmail App Password details
# If skipped, the app runs in mock mode — notifications are logged to console

# 3. Start all services
docker compose up --build

# 4. Open the app
# Frontend:      http://localhost:3000
# API Gateway:   http://localhost:4000
# ActiveMQ UI:   http://localhost:8161  (admin / admin)
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials. All variables are optional — the app degrades gracefully to mock mode without them.

| Variable | Description |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio account SID for SMS |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio sender phone number |
| `SMTP_HOST` | SMTP host (default: `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (default: `587`) |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Gmail 16-character App Password |

---

## API Reference

All requests go through the API Gateway at `http://localhost:4000`.

### Authentication — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/verify` | Verify a JWT token |

### Items — `/api/items`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/items` | List items (with filters) |
| POST | `/api/items` | Report a new item |
| GET | `/api/items/:id` | Get item details |
| PUT | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |
| GET | `/api/items/stats` | Get platform statistics |

### Claims — `/api/claims`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/claims` | Submit a claim |
| GET | `/api/claims/my` | Get current user's claims |
| GET | `/api/claims/item/:itemId` | Get claims for an item |
| PUT | `/api/claims/:id/approve` | Approve a claim |
| PUT | `/api/claims/:id/reject` | Reject a claim |

### Notifications — `/api/notifications`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user's notifications |
| PUT | `/api/notifications/:id/read` | Mark a notification as read |
| PUT | `/api/notifications/read-all` | Mark all notifications as read |

### Search — `/api/search`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/search?q=...` | Full-text search with filters |
| GET | `/api/search/suggest?q=...` | Autocomplete suggestions |
| GET | `/api/search/trending` | Trending search terms |

---

## Project Structure

```
campus-lost-found/
├── api-gateway/              # Reverse proxy — routes all /api/* traffic
├── auth-service/             # JWT auth, user registration/login (PostgreSQL)
├── item-service/             # Item CRUD + image storage (MongoDB)
├── claim-service/            # Claims workflow + approval logic (PostgreSQL)
├── notification-service/     # Email (Nodemailer) + SMS (Twilio) dispatcher (MongoDB)
├── search-service/           # Full-text search + autocomplete + trending (MongoDB)
├── frontend/
│   └── src/
│       ├── pages/            # HomePage, ItemsPage, ReportItemPage, ClaimsPage, ...
│       ├── components/       # Navbar, shared UI
│       ├── store/slices/     # Redux state slices (auth, items, claims, notifications, search)
│       ├── saga/             # Redux-Saga async side-effects
│       └── services/api.js   # Centralised Axios API client
├── init-postgres.sql         # Database schema and seed data
├── docker-compose.yml        # Full stack orchestration
└── .env.example              # Environment variable template
```

---

## License

This project is open source and available under the [MIT License](LICENSE).

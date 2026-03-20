# ⛰ FieldTrip

**Course:** CS 5610 – Web Development | Northeastern University

**Authors:** Ayush Miharia & Siddharth Agarwal

**Project:** Assignment 3 – Full Stack Web Application (React + Node + Express + MongoDB)

**Live Demo:** https://fieldtrip.onrender.com

**PPT Link:** https://docs.google.com/presentation/d/1nEbqm6wGVyhJvsfz9Qj6Q5Itr2LVGP_16gyWVzxpEwA/edit?usp=sharing

**Document Link:** https://docs.google.com/document/d/1Dd9h_HhzLoBJu5PGJiwVbJvbLOSGv-1YlYVILsRUaNA/edit?usp=sharing

**Video Link:** _coming soon_

**Class Link:** https://www.khoury.northeastern.edu/
Course: CS5610 – Web Development
University: Northeastern University, Boston
Semester: Spring 2026

---

## Project Objective

FieldTrip is a peer-driven micro-adventure platform where college students post activities they've discovered, schedule group trips, manage RSVPs, and leave honest reviews — because group plans only work when people actually show up.

The project has a clean separation of concerns — **Ayush owns the activities management features** and **Siddharth owns the trip sessions & community features**, with both sharing a common authentication system, user profiles, and admin panel.

---

## Screenshot

![FieldTrip Screenshot](fieldtripss.jpeg)

---

## Features

### User Features

- Sign up / Sign in with username and password
- Browse all activities without logging in (public access)
- Post activities with title, category (hiking/food/sports/culture/nightlife), difficulty, cost, group size cap, location, and format (outdoor/indoor/virtual)
- Search and filter activities by category, difficulty, cost range, format, and keyword
- Duplicate prevention — same title by the same user is rejected
- Schedule trips for any activity with a future date, time, and meeting point
- Join or leave trips with automatic capacity management (auto-sets status to "full" when at max)
- Mark trips as completed or cancelled (organizer only)
- Leave star ratings (1–5) and written feedback on completed trips (participants only)
- "My Trips" dashboard showing organized and joined trips, split into Upcoming / Completed / Cancelled
- Edit upcoming trip details inline (date, meeting point) from My Trips
- Personal stats dashboard — activities created, trips organized, trips joined, completion rate, organizer rating, reviews given
- Future date validation — cannot schedule or edit trips with past dates
- User profiles with name, bio, trips organized, trips attended, and overall rating

### Admin Features

- Separate admin login (password protected)
- View all 1,000+ activities in a paginated, searchable table with numbered rows
- View all registered users in a paginated, searchable table
- See activity title, category, difficulty, cost, location, creator, and date
- See user name, username, role, trips organized, trips attended, rating, and join date
- Delete any activity or user
- Total entry counts displayed prominently on each tab

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 with Hooks, React Router v6, PropTypes |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (native driver — no Mongoose) |
| Auth | Passport.js (Local Strategy) + bcrypt + express-session + connect-mongo |
| HTTP | Native `fetch` API (no Axios) |
| CORS | Manual Express middleware (no cors library) |
| CSS | CSS Modules (one file per component) |
| Linting | ESLint |
| Formatting | Prettier |
| Deployment | Render.com |

---

## Work Distribution

### Ayush — Activities Management

**Backend:**

- `routes/ayush/activities.js` — Full CRUD for activities, search and filter, stats aggregation, duplicate prevention

**Frontend:**

- `components/ayush/ActivityList/` — Browse and search activities with pagination
- `components/ayush/ActivityCard/` — Activity card display with category badges, cost, location
- `components/ayush/ActivityForm/` — Create and edit activity forms with validation
- `components/ayush/ActivityDetail/` — Full activity view with trip scheduling and management
- `components/ayush/SearchBar/` — Search input with filter dropdowns (category, difficulty, format, cost)

**User Stories Covered:**

- Browse all activities with search and filter by category, difficulty, cost range, format, and keyword
- Create, view, edit, and delete activities with title, category, difficulty, cost, group size, location, format, and description
- Duplicate prevention — same title by the same user is rejected with a clear error
- Activity detail page shows full info plus all scheduled trips for that activity
- Schedule trips directly from the activity detail page with future date validation

---

### Siddharth — Trip Sessions & Community

**Backend:**

- `routes/siddharth/trips.js` — Full CRUD for trips, join/leave, complete/cancel, review system, stats aggregation, future date validation, participant filter

**Frontend:**

- `components/siddharth/TripList/` — Browse all trips with status filter and pagination
- `components/siddharth/TripCard/` — Trip card with RSVP list, reviews, and join/leave/complete/cancel actions
- `components/siddharth/TripForm/` — Schedule a new trip with activity search, date picker (future only), and meeting point
- `components/siddharth/MyTrips/` — Personal trip dashboard split into Organized vs Joined, with Upcoming/Completed/Cancelled tabs and inline trip editing
- `components/siddharth/ReviewForm/` — Star rating (1–5) with interactive hover + written feedback form

**User Stories Covered:**

- Schedule trips for any activity with a specific future date, time, and meeting point
- Join or leave trips — auto-updates status to "full" when capacity is reached, reopens when someone leaves
- Mark trips as completed (organizer only) — unlocks the review system
- Cancel trips (organizer only) — status changes to cancelled
- Leave star ratings and written reviews on completed trips (participants only, one review per person)
- "My Trips" page shows all trips organized or joined, split by status, with edit capability for upcoming organized trips
- Future date validation on both create and edit — past dates are rejected on both client and server side

---

### Common Files — Built Together

The following infrastructure files were built collaboratively by Ayush and Siddharth:

| File | Description |
|------|-------------|
| `backend/server.js` | Express server, session config, trust proxy, route mounting |
| `backend/config/passport.js` | Passport local strategy + `isAuthenticated` middleware |
| `backend/db/connection.js` | MongoDB native driver connection module |
| `backend/db/seed.js` | Seeds 1,000 activities + 500 trips + 52 users (including admin) |
| `backend/routes/shared/auth.js` | Register, login, logout, session check, profile update, personal stats |
| `backend/routes/shared/admin.js` | Admin panel — paginated activities and users, delete any entry |
| `frontend/src/App.js` | React app with routing, auth state, admin redirect |
| `frontend/src/utils/api.js` | Shared API module (all fetch calls to backend) |
| `frontend/src/components/shared/Navbar/` | Navigation bar with auth-aware links and admin detection |
| `frontend/src/components/shared/Footer/` | Site footer |
| `frontend/src/components/shared/Home/` | Guest landing page with CTA buttons |
| `frontend/src/components/shared/Login/` | Login form with demo credentials and admin redirect |
| `frontend/src/components/shared/Register/` | Registration form |
| `frontend/src/components/shared/Profile/` | User profile view and edit |
| `frontend/src/components/shared/Stats/` | Personal stats dashboard (activities, trips, ratings) |
| `frontend/src/components/shared/Admin/` | Admin panel with Activities and Users tabs |
| `frontend/src/index.css` | Global styles (buttons, cards, forms, badges, pagination) |
| `frontend/src/App.css` | App-level layout styles |
| `frontend/package.json` | Frontend dependencies and scripts |
| `backend/package.json` | Backend dependencies and scripts |
| `backend/.eslintrc.json` | ESLint config (no errors) |
| `backend/.prettierrc` | Prettier formatting config |
| `backend/.env.example` | Environment variable template |
| `LICENSE` | MIT license |
| `README.md` | This file |

---

## MongoDB Collections

| Collection | Description |
|------------|-------------|
| `users` | All registered accounts (52 seeded + new signups), with role, rating, trip counts |
| `activities` | Activity listings with category, difficulty, cost, location, format (1,000 seeded) |
| `trips` | Trip sessions with RSVP lists, feedback/reviews, status, meeting points (500 seeded) |

---

## Project Structure

```
fieldtrip/
├── backend/
│   ├── routes/
│   │   ├── shared/
│   │   │   ├── auth.js                    ← Shared
│   │   │   └── admin.js                   ← Shared
│   │   ├── ayush/
│   │   │   └── activities.js              ← Ayush
│   │   └── siddharth/
│   │       └── trips.js                   ← Siddharth
│   │
│   ├── config/
│   │   └── passport.js                    ← Shared
│   ├── db/
│   │   ├── connection.js                  ← Shared
│   │   └── seed.js                        ← Shared
│   │
│   ├── server.js                          ← Shared
│   ├── package.json                       ← Shared
│   ├── .eslintrc.json                     ← Shared
│   ├── .prettierrc                        ← Shared
│   └── .env.example                       ← Shared
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ayush/
│   │   │   │   ├── ActivityList/          ← Ayush
│   │   │   │   ├── ActivityCard/          ← Ayush
│   │   │   │   ├── ActivityForm/          ← Ayush
│   │   │   │   ├── ActivityDetail/        ← Ayush
│   │   │   │   └── SearchBar/             ← Ayush
│   │   │   │
│   │   │   ├── siddharth/
│   │   │   │   ├── TripList/              ← Siddharth
│   │   │   │   ├── TripCard/              ← Siddharth
│   │   │   │   ├── TripForm/              ← Siddharth
│   │   │   │   ├── MyTrips/               ← Siddharth
│   │   │   │   └── ReviewForm/            ← Siddharth
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── Navbar/                ← Shared
│   │   │       ├── Footer/                ← Shared
│   │   │       ├── Home/                  ← Shared
│   │   │       ├── Login/                 ← Shared
│   │   │       ├── Register/              ← Shared
│   │   │       ├── Profile/               ← Shared
│   │   │       ├── Stats/                 ← Shared
│   │   │       └── Admin/                 ← Shared
│   │   │
│   │   ├── utils/
│   │   │   └── api.js                     ← Shared
│   │   ├── App.js                         ← Shared
│   │   ├── App.css                        ← Shared
│   │   ├── index.js                       ← Shared
│   │   └── index.css                      ← Shared
│   │
│   ├── public/
│   │   └── index.html                     ← Shared
│   ├── package.json                       ← Shared
│   ├── .eslintrc.json                     ← Shared
│   └── .prettierrc                        ← Shared
│
├── LICENSE                                ← Shared
└── README.md                              ← Shared
```

---

## Instructions to Build & Run

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account (free tier works)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/AyushMiharia/fieldtrip.git
cd fieldtrip

# 2. Install backend dependencies
cd backend
npm install

# 3. Create your .env file (copy the example and fill in your values)
cp .env.example .env
```

Your `.env` file should look like:

```
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/fieldtrip?retryWrites=true&w=majority
SESSION_SECRET=your-secret-key-here
PORT=5001
NODE_ENV=development
```

```bash
# 4. Seed the database (creates 1,000 activities, 500 trips, 52 users)
npm run seed

# 5. Start the backend server
npm start
```

```bash
# 6. In a new terminal — install and start the frontend
cd frontend
npm install
npm start
```

Open **http://localhost:3000** in your browser.

### Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Regular User | `testuser` | `password123` |
| Admin | `admin` | `password123` |

---

## License

MIT — see [LICENSE](./LICENSE)

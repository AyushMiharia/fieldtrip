# FieldTrip ⛰ — Plan Less. Explore More.

A peer-driven micro-adventure platform where students post activities, schedule group trips, manage RSVPs, and leave honest reviews.

![FieldTrip Screenshot](screenshot.png)

## Authors

- **Ayush Miharia** — Activities Management (Full Stack) · `activities` collection
- **Siddharth Agarwal** — Trip Sessions (Full Stack) · `trips` collection

## Class Link

CS-5610 Web Development — Northeastern University
Instructor: John Alexis Guerra Gomez

## Project Objective

FieldTrip solves the problem of disorganized group outings among college students. It provides a structured platform to discover activities, schedule trips with RSVPs, and review organizers for accountability.

## Tech Stack

- **Frontend:** React 18 with Hooks, React Router v6, PropTypes
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (native driver — no Mongoose)
- **Authentication:** Passport.js with Local Strategy
- **HTTP:** Native `fetch` API (no Axios)
- **CORS:** Manual middleware (no cors library)

## Features

### Activities (Ayush)
- Full CRUD on activity listings
- Search and filter by category, difficulty, cost range, format, and keyword
- Duplicate prevention (same title + same user = rejected)
- Stats dashboard for personal activity metrics

### Trips (Siddharth)
- Full CRUD on trip records
- Join, leave, cancel, and complete trips
- Star ratings and written feedback on completed trips
- My Trips page: upcoming vs completed, with inline trip editing
- Future date validation on all trip creation and editing

### Shared
- Landing page for guests, auto-redirect for authenticated users
- User authentication (register, login, logout, session persistence)
- User profiles with stats and rating display
- Personal stats page (activities created, trips organized/joined, ratings)
- Admin panel with paginated views of all activities and users

### Admin
- Separate admin login (`admin` / `password123`)
- Admin Panel with two tabs: Activities and Users
- Both tabs show paginated, numbered entries with search
- Admin can delete any activity or user

## Instructions to Build

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd fieldtrip
   ```

2. **Backend setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and session secret
   ```

3. **Seed the database** (creates 1,000+ records)
   ```bash
   npm run seed
   ```

4. **Start the backend**
   ```bash
   npm start
   # Server runs on http://localhost:5001
   ```

5. **Frontend setup** (new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   # App opens at http://localhost:3000
   ```

### Demo Accounts
- Regular user: `testuser` / `password123`
- Admin: `admin` / `password123`

## How to Use

1. **Landing Page** — Guests see a welcome page with Sign Up / Log In options, plus a link to browse activities without an account.
2. **Browse Activities** — The Activities tab is always accessible. Use search and filters to find what interests you.
3. **Sign Up / Log In** — Create an account to unlock posting, joining trips, and reviewing.
4. **Post an Activity** — Click "+ Post Activity" to share a new discovery.
5. **Schedule a Trip** — On any activity detail page, click "Schedule Trip" to set a future date and meeting point.
6. **Join a Trip** — Click "Join Trip" on any open trip to RSVP.
7. **My Trips** — View your organized and joined trips, split by Upcoming / Completed / Cancelled. Edit upcoming trips you organized.
8. **Complete & Review** — Organizer marks trip complete; participants leave star ratings and feedback.
9. **My Stats** — Personal dashboard showing your activities, trips, and ratings. New users start at zero.
10. **Admin** — Log in as admin to see paginated lists of all activities and users with total counts and search.

## Project Structure

```
fieldtrip/
├── backend/
│   ├── config/
│   │   └── passport.js              # Passport local strategy (shared)
│   ├── db/
│   │   ├── connection.js            # MongoDB native driver connection (shared)
│   │   └── seed.js                  # Seed script (1000+ records) (shared)
│   ├── routes/
│   │   ├── ayush/
│   │   │   └── activities.js        # Activities CRUD + search + stats
│   │   ├── siddharth/
│   │   │   └── trips.js             # Trips CRUD + join/leave/review
│   │   └── shared/
│   │       ├── auth.js              # Auth + profile + personal stats
│   │       └── admin.js             # Admin panel endpoints
│   ├── server.js
│   ├── package.json
│   ├── .eslintrc.json
│   ├── .prettierrc
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ayush/               # Ayush's components
│   │   │   │   ├── ActivityList/    # Browse + search activities
│   │   │   │   ├── ActivityCard/    # Activity card display
│   │   │   │   ├── ActivityForm/    # Create/edit activities
│   │   │   │   ├── ActivityDetail/  # Full detail + trip management
│   │   │   │   └── SearchBar/       # Search & filter controls
│   │   │   ├── siddharth/           # Siddharth's components
│   │   │   │   ├── TripList/        # Browse all trips
│   │   │   │   ├── TripCard/        # Trip card with actions
│   │   │   │   ├── TripForm/        # Schedule a trip
│   │   │   │   ├── MyTrips/         # Personal trip management
│   │   │   │   └── ReviewForm/      # Star rating + comment
│   │   │   └── shared/              # Shared components
│   │   │       ├── Navbar/          # Navigation bar
│   │   │       ├── Footer/          # Site footer
│   │   │       ├── Home/            # Guest landing page
│   │   │       ├── Login/           # Login form
│   │   │       ├── Register/        # Registration form
│   │   │       ├── Profile/         # User profile
│   │   │       ├── Stats/           # Personal stats dashboard
│   │   │       └── Admin/           # Admin panel
│   │   ├── utils/
│   │   │   └── api.js               # Fetch-based API utility
│   │   ├── App.js / App.css
│   │   ├── index.js / index.css
│   ├── package.json
│   ├── .eslintrc.json
│   └── .prettierrc
├── LICENSE                           # MIT License
└── README.md
```

## Rubric Compliance

- [x] Design document (description, personas, user stories, mockups)
- [x] App accomplishes all approved requirements
- [x] Usable with instructions
- [x] Actually useful for real users
- [x] ESLint config with no errors
- [x] Code properly organized (components in own files, DB separate, CSS per component)
- [x] 17 React Components using hooks (well above the 3 minimum)
- [x] Each React Component in its own file
- [x] Deployable on public server
- [x] 3 Mongo Collections (users, activities, trips) with full CRUD
- [x] 1,000+ synthetic records via seed script
- [x] Node + Express backend
- [x] Formatted with Prettier
- [x] Standard HTML elements only (proper buttons, forms, inputs, selects)
- [x] CSS organized by component (matching .css file per component)
- [x] Descriptive README with authors, class link, objective, screenshot, build instructions
- [x] No exposed credentials (.env.example, .gitignore protects .env)
- [x] Separate package.json for backend and frontend
- [x] MIT License
- [x] No leftover code (no routes/users.js, no CRA favicon)
- [x] PropTypes defined for every component receiving props
- [x] No Axios, Mongoose, CORS library, or other prohibited libraries
- [x] Authentication via Passport.js with Local Strategy

## License

MIT License — see [LICENSE](./LICENSE)

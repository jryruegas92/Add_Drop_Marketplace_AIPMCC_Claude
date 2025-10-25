# Haas Trade Hub - Course Marketplace MVP

A full-stack marketplace platform for UC Berkeley Haas MBA students to coordinate class trades during add/drop periods.

## Problem Statement

Students waste hours manually checking the course portal and coordinating trades through scattered WhatsApp messages during the 2-week add/drop window. There's no centralized place to see who's dropping classes or looking for specific classes.

## Solution

Haas Trade Hub provides a centralized, mobile-responsive marketplace where students can:
- Post classes they're dropping (auction style or targeted trades)
- Browse available trades with filtering and search
- Make offers and negotiate trades
- Get instant contact info sharing when trades are accepted

## Tech Stack

**Frontend:**
- React 18
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Context API for state management

**Backend:**
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT authentication
- bcrypt for password hashing

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── db/            # Migrations and seed data
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API routes
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Server entry point
│   ├── .env               # Environment variables
│   └── package.json
│
└── frontend/
    ├── app/               # Next.js app directory
    │   ├── auth/         # Login & register pages
    │   ├── dashboard/    # User dashboard
    │   ├── marketplace/  # Browse posts
    │   └── profile/      # Profile & class management
    ├── components/        # React components
    ├── contexts/         # Auth context
    ├── lib/
    │   ├── api/          # API client
    │   └── types/        # TypeScript types
    └── package.json
```

## Database Schema

### Users
- id, email, password_hash, name
- graduation_year, program_type
- phone, contact_visible

### Classes
- id, code, title, professor, semester

### Enrolled_Classes (Join Table)
- user_id, class_id

### Posts
- id, user_id, post_type
- class_dropping_id, class_wanted_id
- notes, timing, status

### Offers
- id, post_id, offerer_id
- parent_offer_id (for counter-offers)
- offered_class_ids (array)
- message, status

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Add_Drop_Marketplace_AIPMCC
```

### 2. Database Setup

```bash
# Install PostgreSQL if not already installed
# On macOS:
brew install postgresql
brew services start postgresql

# Create database
createdb haas_trade_hub

# Or using psql:
psql postgres
CREATE DATABASE haas_trade_hub;
\q
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env with your database credentials
# Required variables:
# - DB_HOST=localhost
# - DB_PORT=5432
# - DB_NAME=haas_trade_hub
# - DB_USER=postgres
# - DB_PASSWORD=your_password
# - JWT_SECRET=your_secret_key

# Run database migrations
npm run build
npm run migrate

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## Testing the Application

### Test Credentials

After seeding the database, you can login with:

**Email:** `alice.chen@haas.berkeley.edu`
**Password:** `Password123!`

Other test users:
- `bob.smith@berkeley.edu`
- `carol.jones@haas.berkeley.edu`
- `david.kim@berkeley.edu`
- `emma.wilson@haas.berkeley.edu`

All test users have the same password: `Password123!`

### Sample Classes

The seed data includes 20 MBA classes including:
- MBA201 - Microeconomic Analysis
- MBA203 - Introduction to Finance
- MBA211 - Marketing Management
- MBA223 - Negotiations
- MBA237 - Entrepreneurship
- And more...

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Classes
- `GET /api/classes/all` - Get all available classes
- `GET /api/classes/enrolled` - Get user's enrolled classes (protected)
- `POST /api/classes/enroll` - Enroll in a class (protected)
- `DELETE /api/classes/enroll/:class_id` - Unenroll from class (protected)

### Posts
- `GET /api/posts` - Get all posts (with optional filters)
- `GET /api/posts/my` - Get user's posts (protected)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post (protected)
- `PATCH /api/posts/:id/status` - Update post status (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

### Offers
- `GET /api/offers/post/:post_id` - Get offers for a post (protected)
- `GET /api/offers/my` - Get offers user made (protected)
- `GET /api/offers/received` - Get offers user received (protected)
- `POST /api/offers` - Create new offer (protected)
- `PATCH /api/offers/:id/status` - Accept/reject offer (protected)

## Features

### P0 - MVP Features (Implemented)

✅ **User Authentication**
- Haas email validation (@haas.berkeley.edu or @berkeley.edu)
- Secure JWT-based authentication
- User profiles with graduation year and program type

✅ **Class Schedule Management**
- Add/remove enrolled classes
- View all available classes
- Dropdown selection from pre-seeded class list

✅ **Marketplace Posts - 3 Types**
- "Dropping Class X - open to offers" (auction style)
- "Dropping Class X for Class Y" (targeted trade)
- "Looking for Class X" (demand signal)
- Posts show class details, notes, timing, and poster info

✅ **Browse Marketplace**
- View all active posts
- Filter by post type
- Search by class name/code
- Mobile-responsive grid layout

✅ **Offer & Negotiation System**
- Make offers with your enrolled classes
- Accept/Reject offers
- Contact info sharing on acceptance
- Posts automatically marked "Trade Agreed"

✅ **User Dashboard**
- View "My Posts" with offer counts
- View "My Offers" (made and received)
- Manage post status (close/delete)
- Accept/reject received offers

### Non-Functional Requirements

✅ **Mobile-Responsive Design**
- Fully responsive Tailwind CSS
- Works on phones, tablets, and desktops
- Touch-friendly interface

✅ **Performance**
- Fast page loads with Next.js
- Efficient database queries with indexes
- Client-side state management

✅ **Clean, Professional UI**
- Modern design with Tailwind CSS
- Intuitive navigation
- Clear visual hierarchy

## Development Scripts

### Backend
```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript
npm start        # Run compiled code
npm run migrate  # Run database migrations
npm run seed     # Seed database with sample data
```

### Frontend
```bash
npm run dev      # Start Next.js development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=haas_trade_hub
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Production Deployment

### Backend Deployment (Example: Heroku)
```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_production_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
heroku run npm run seed
```

### Frontend Deployment (Example: Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
```

## Security Considerations

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for stateless authentication
- Email validation enforces Haas/Berkeley domains
- Protected API routes require authentication
- SQL injection prevention with parameterized queries
- CORS configured for frontend origin

## Future Enhancements (Post-MVP)

- Real-time notifications
- Email notifications for new offers
- Trade history tracking
- User ratings/reputation system
- Class waitlist integration
- Advanced search filters
- Mobile app (React Native)
- Admin dashboard

## Contributing

This is an MVP for the Haas School of Business. For feature requests or bug reports, please open an issue.

## License

MIT License - Built for educational purposes

## Contact

For questions or support, contact the development team.

---

**Built with ❤️ for Haas MBA students**
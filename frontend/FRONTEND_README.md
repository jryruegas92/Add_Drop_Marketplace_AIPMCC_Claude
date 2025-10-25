# Haas Trade Hub - Frontend

React 18 + Next.js 14 frontend for the Haas Trade Hub marketplace platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: Context API (Auth)

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running on port 5000

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the frontend directory:

```bash
cp .env.example .env.local
```

The file should contain:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── auth/
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── dashboard/               # User dashboard (My Posts, Offers)
│   ├── marketplace/             # Browse & create posts
│   ├── profile/                 # Profile & class management
│   ├── layout.tsx               # Root layout with AuthProvider
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── components/
│   └── layout/
│       └── Navigation.tsx       # Main navigation component
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── lib/
│   ├── api/                     # API client functions
│   │   ├── auth.ts
│   │   ├── classes.ts
│   │   ├── posts.ts
│   │   ├── offers.ts
│   │   └── client.ts            # Base API client
│   └── types/
│       └── index.ts             # TypeScript types
└── package.json
```

## Features

### Authentication
- Login with Haas email
- Registration with email validation
- JWT token management
- Protected routes

### Class Management
- Add enrolled classes
- View all available classes
- Remove classes from schedule

### Marketplace
- Create 3 types of posts:
  - Dropping Class (open to offers)
  - Dropping for Specific Class (targeted trade)
  - Looking for Class
- Browse and filter posts
- Search by class name/code
- Mobile-responsive design

### Dashboard
- View your posts with offer counts
- See offers you've made
- Manage offers you've received
- Accept/reject offers
- Contact info sharing on acceptance

### Profile
- Update personal information
- Manage class schedule
- Configure contact visibility

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api`

Endpoints used:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `GET /api/classes/all` - Get all classes
- `GET /api/classes/enrolled` - Get user's classes
- `POST /api/classes/enroll` - Add class
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `GET /api/offers/my` - Get my offers
- `GET /api/offers/received` - Get received offers
- `POST /api/offers` - Make offer
- `PATCH /api/offers/:id/status` - Accept/reject offer

## Testing

### Test Credentials
After seeding the backend database:

- Email: `alice.chen@haas.berkeley.edu`
- Password: `Password123!`

Other test users: `bob.smith@berkeley.edu`, `carol.jones@haas.berkeley.edu`

## Styling

Uses Tailwind CSS for responsive design:
- Mobile-first approach
- Dark text on inputs (text-gray-900)
- Blue accent color (#2563eb)
- Gray neutral colors
- Rounded corners and shadows

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variable:
```bash
vercel env add NEXT_PUBLIC_API_URL
```
Enter your production API URL (e.g., `https://your-api.herokuapp.com/api`)

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Connection Errors
- Verify backend is running on port 5000
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Ensure CORS is configured in backend
- Check browser console for specific errors

### White Text in Input Fields
The app now has dark text (text-gray-900) in all input fields. If you see white text, try:
1. Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. Clear browser cache
3. Check that the latest code is pulled

## GitHub Codespaces

If running in Codespaces:
1. Ports 3000 and 5000 should auto-forward
2. Make ports Public in PORTS tab
3. Click globe icon to open in browser
4. Backend must be running first

## Support

For issues or questions:
- Check main README.md in root directory
- Review API documentation
- Verify backend is running correctly

## License

MIT License - Built for Haas MBA students

# Mini AMHS - Setup Guide

## Issues Found and Fixed

### 1. ✅ Fixed Next.js Configuration Warning
- **Issue**: Invalid `appDir` option in `next.config.js`
- **Fix**: Removed deprecated `appDir` option from experimental config

### 2. ✅ Fixed Database Name Mismatch
- **Issue**: Database init script created `mini_amhs` but README mentioned `amhs_demo`
- **Fix**: Updated `database/init.sql` to use `amhs_demo` consistently

### 3. ✅ Fixed Duplicate API Routes
- **Issue**: Backend had duplicate route handlers for auth endpoints
- **Fix**: Removed duplicate `/api/auth/register` and `/api/auth/login` routes

### 4. ⚠️ Missing Environment Files
- **Issue**: No `.env` files for configuration
- **Solution**: Create the following files manually

## Required Environment Files

### Frontend Environment (frontend/.env)
Create `frontend/.env` with:
```env
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:8080

# App Configuration
NEXT_PUBLIC_APP_NAME=Mini AMHS
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NODE_ENV=development
```

### Backend Environment (backend/.env)
Create `backend/.env` with:
```env
# Database Configuration
DB_DSN=postgres://postgres:postgres@localhost:5432/amhs_demo?sslmode=disable

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Setup Instructions

### Prerequisites
- Go 1.18+ 
- Node.js 18+
- PostgreSQL
- Git

### 1. Database Setup
```bash
# Create database
createdb -U postgres amhs_demo

# Initialize tables
psql -U postgres -d amhs_demo -f database/init.sql
```

### 2. Backend Setup
```bash
cd backend
go mod tidy
go run .
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Testing the Application

### Backend Health Check
```bash
curl http://localhost:8080/api/health
```

### Test Message Creation
```bash
curl -X POST http://localhost:8080/api/messages \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{"receiver":"TEST","subject":"Test Message","body":"Hello World"}'
```

## Common Issues and Solutions

### 1. Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `backend/.env`
- Verify database exists: `psql -U postgres -l`

### 2. CORS Errors
- Check `CORS_ORIGIN` in `backend/.env` matches frontend URL
- Ensure backend is running on port 8080

### 3. JWT Token Issues
- Verify `JWT_SECRET_KEY` is set in `backend/.env`
- Check token format in Authorization header

### 4. Frontend Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors: `npm run type-check`

## Project Structure
```
mini-amhs-demo-full-main/
├── backend/           # Go API server
├── frontend/          # Next.js React app
├── database/          # SQL initialization scripts
└── README.md         # Original documentation
```

## Next Steps
1. Create the environment files as shown above
2. Start PostgreSQL service
3. Run database initialization
4. Start backend server
5. Start frontend development server
6. Open http://localhost:3000 in your browser

The application should now work without the previous errors!

# Change Management System - Quick Start Guide

## Prerequisites

- Node.js (v18 or higher)
- MariaDB 12.1
- Git

## Database Setup

1. **Create the database:**
   ```sql
   CREATE DATABASE change_management;
   ```

2. **Run the schema:**
   ```bash
   mysql -u root -p change_management < change-management-system/backend/src/database/schema.sql
   ```

3. **Seed benefit scoring configuration:**
   ```bash
   mysql -u root -p change_management < change-management-system/backend/src/database/seed-all-benefit-configs.sql
   ```

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd change-management-system/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=change_management
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The backend will run on http://localhost:5000

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd change-management-system/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on http://localhost:5173

## Alternative: Run from Project Root (Recommended)

The project uses npm workspaces. You can run everything from the root directory:

```bash
cd change-management-system

# Install all dependencies (backend + frontend + shared packages)
npm install

# Run both frontend and backend together
npm run dev              # Uses local database
npm run dev:prod         # Uses production database (testing)

# Run individually (if needed)
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only
```

See [ENVIRONMENT_SWITCHING.md](change-management-system/ENVIRONMENT_SWITCHING.md) for switching between local and production databases.

## First Login

### Local Development

1. Open http://localhost:5173 in your browser
2. Register a new account
3. **Manually set user as admin** via MySQL:
   ```bash
   mysql -u root -p change_management
   ```
   ```sql
   UPDATE users SET role='admin' WHERE email='your@email.com';
   ```
4. Refresh page and login with admin privileges

### Production Environment

Default admin account (already created):
- **Email:** admin@example.com
- **Password:** password123

⚠️ **IMPORTANT:** Change the password immediately after first login!

## What's Next?

### Learn More

For detailed information about the system, see:

- **[README.md](change-management-system/README.md)** - Full feature list and technical details
- **[FEATURES_CHECKLIST.md](change-management-system/FEATURES_CHECKLIST.md)** - Complete feature tracking
- **[DEVELOPMENT.md](change-management-system/DEVELOPMENT.md)** - Development guide and best practices
- **[PRODUCTION_DEPLOYMENT.md](change-management-system/PRODUCTION_DEPLOYMENT.md)** - Production deployment guide
- **[API Documentation](change-management-system/README.md#-api-endpoints)** - All API endpoints

### Key Features Implemented

✅ Change Request Wizard (multi-step)
✅ Database-driven scoring system
✅ CAB Review interface
✅ Metrics Dashboard with analytics
✅ Benefit & Effort Assessment tools
✅ Admin Dashboard
✅ Environment switching (local/production)

## Troubleshooting

### Backend won't start
- Check MariaDB is running
- Verify database credentials in `.env`
- Ensure database schema has been created

### Frontend shows "Failed to load metrics"
- Restart frontend dev server after creating `.env` file
- Vite only loads environment variables on startup

### Authentication issues
- Clear browser localStorage: `localStorage.clear()`
- Check JWT_SECRET is set in backend `.env`
- Verify backend is running on port 5000

### Database connection errors
- Verify MariaDB service is running
- Check credentials match between `.env` and MySQL
- Ensure `change_management` database exists

## Support

For issues or questions, please check:
1. Backend terminal for server errors
2. Browser console (F12) for frontend errors
3. Network tab for API call failures

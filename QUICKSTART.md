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

## First Login

1. Open http://localhost:5173 in your browser
2. Register a new account (first user will be created as admin)
3. Login with your credentials

## Key Features

### Implemented Features

- **User Dashboard**: View and manage change requests
- **Change Request Wizard**: Multi-step form for creating change requests
  - Basic information
  - Benefit reasons (revenue, cost reduction, customer impact, etc.)
  - Impact assessment
  - Review and submit
- **Benefit Assessment**: Configure and assess benefit scores with weighting
- **Effort Assessment**: Evaluate effort required using Eisenhower Matrix
- **Metrics Dashboard**: Real-time analytics
  - Changes by benefit type (pie chart)
  - Revenue improvement & cost savings (bar chart)
  - Hours saved through process improvements
  - Status counts (submitted, rejected, scheduled, completed)
- **Benefit Scoring Configuration**: Database-driven scoring system
- **Admin Dashboard**: Manage users and system settings
- **CAB Review**: Change Advisory Board review interface
- **Debug View**: Developer tools for inspecting change requests

### Key Improvements

- **UK-Based Currency**: All financial displays use £ (GBP)
- **Database-Driven Scoring**: Benefit scores calculated from `benefit_scoring_config` table
- **Multi-Benefit Support**: Changes can have multiple benefit types
- **Delete Functionality**: Remove change requests from dashboard
- **Benefit Icons**: Visual indicators on dashboard with tooltips
- **Form Validation**: Prevents premature submission in multi-step wizard

## Database Schema

The system uses MariaDB with the following key tables:

- `users`: User accounts and authentication
- `change_requests`: Core change request data with JSON `wizard_data` field
- `benefit_scoring_config`: Configurable benefit scoring parameters
  - Revenue Improvement: £100,000 = 100 points
  - Cost Reduction: £80,000 = 100 points
  - Customer Impact: 10,000 customers = 100 points
  - Process Improvement: 100% efficiency = 100 points
  - Internal QoL: 500 employees = 100 points
  - Strategic Alignment: 10/10 scale = 100 points

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Change Requests
- `GET /api/changes` - List all changes
- `GET /api/changes/:id` - Get specific change
- `POST /api/changes` - Create new change
- `PUT /api/changes/:id` - Update change
- `DELETE /api/changes/:id` - Delete change
- `POST /api/changes/:id/approve` - Approve change
- `POST /api/changes/:id/reject` - Reject change
- `PUT /api/changes/:id/benefit-score` - Update benefit score

### Benefit Configuration
- `GET /api/benefit-config` - Get all benefit scoring configs
- `POST /api/benefit-config` - Create config
- `PUT /api/benefit-config/:id` - Update config

### Metrics
- `GET /api/metrics` - Get dashboard metrics

## Development Notes

### Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- MariaDB (mysql2)
- JWT Authentication
- Socket.io (for real-time updates)

**Frontend:**
- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router
- Recharts (for analytics)
- React Flow (for dependency visualization)
- Axios
- Sonner (toast notifications)

### Project Structure

```
change-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app config
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   ├── database/        # SQL schema and seeds
│   │   └── index.ts         # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── lib/             # Utility functions (benefitCalculator, etc.)
│   │   ├── pages/           # Page components
│   │   ├── store/           # State management (Zustand)
│   │   └── App.tsx          # Main app component
│   └── package.json
└── QUICKSTART.md
```

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

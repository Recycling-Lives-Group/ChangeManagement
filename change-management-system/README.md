# Change Management System

A comprehensive full-stack Change Management application built with React, TypeScript, Node.js, Express, and MariaDB. This system implements a complete change management workflow with user authentication, approval workflows, benefit scoring, and real-time analytics.

## 🚀 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **React Hook Form** + **Zod** for form validation
- **Recharts** for analytics visualizations
- **React Flow** for dependency planning
- **Axios** for API calls
- **Sonner** for toast notifications

### Backend
- **Node.js** + **Express** with TypeScript
- **MariaDB** database with mysql2
- **JWT** authentication
- **Socket.io** for real-time updates
- **bcrypt** for password hashing

## ✨ Key Features

### User Management
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Requester, CAB Member, etc.)
- ✅ User registration and login

### Change Request Management
- ✅ **Multi-step wizard** for creating change requests
  - Basic information (title, description, proposed date)
  - Benefit reasons (revenue, cost reduction, customer impact, process improvement, internal QoL, risk reduction)
  - Detailed benefit assessment with validation
  - Impact assessment (systems, users, departments, effort, cost)
  - Review and submit
- ✅ **Database-driven benefit scoring system**
  - Configurable scoring thresholds (benefit_scoring_config table)
  - Automated calculation using raw values vs. thresholds
  - Timeline decay scoring
  - Weighted benefit scoring
- ✅ Change request CRUD operations
- ✅ Status tracking and updates
- ✅ Delete functionality with confirmation

### Dashboards

#### User Dashboard
- ✅ View all submitted change requests
- ✅ Status indicators with colour coding
- ✅ Benefit reason icons with hover tooltips
- ✅ Quick actions (View Details, Debug, Delete)
- ✅ Filter by status

#### Metrics Dashboard
- ✅ **Real-time analytics** from MariaDB
- ✅ Changes by benefit type (pie chart)
- ✅ Revenue improvement & cost reduction (bar chart, £ GBP)
- ✅ Hours saved through process improvements
- ✅ KPI cards (submitted, rejected, scheduled, completed counts)

#### Admin Dashboard
- ✅ Organization-wide view
- ✅ User management
- ✅ System settings

### Assessment Tools

#### Benefit Assessment
- ✅ Configure priority weights for benefit types
- ✅ Calculate weighted benefit scores
- ✅ Uses database-driven scoring configuration
- ✅ Eisenhower Matrix visualization
- ✅ Individual benefit factor breakdown

#### Effort Assessment
- ✅ Evaluate effort vs benefit
- ✅ Eisenhower Matrix prioritization
- ✅ Quadrant-based recommendations

### Planning Tools

#### Change Planning Board
- ✅ Visual dependency planning with React Flow
- ✅ Drag-and-drop change request cards
- ✅ Connect cards to show blockers and dependencies
- ✅ Auto-loads from database
- ✅ Interactive canvas with zoom/pan controls

### Other Features
- ✅ **CAB Review** interface
- ✅ **Change Calendar** view
- ✅ **Benefit Scoring Configuration** management
- ✅ **Debug page** for developers (view raw wizard data)
- ✅ Dark mode support
- ✅ Responsive design

## 📊 Benefit Scoring System

The system uses a sophisticated database-driven scoring model:

### Benefit Types & Scoring Thresholds

| Benefit Type | Value for 100 Points | Time Decay (per month) |
|--------------|---------------------|----------------------|
| Revenue Improvement | £100,000 | 5 points |
| Cost Reduction | £80,000 | 4 points |
| Customer Impact | 10,000 customers | 3 points |
| Process Improvement | 100% efficiency | 2 points |
| Internal QoL | 500 employees | 2 points |
| Strategic Alignment | 10/10 scale | 0 points |

### Calculation Flow
1. **Base Score**: `(rawValue / valueFor100Points) × 100` → 0-100 scale
2. **Timeline Score**: `100 - (timelineMonths × timeDecayPerMonth)` → 0-100 scale
3. **Combined Score**: Value score + Timeline score → 0-200 scale
4. **Weighted Score**: Combined score × weight (from Benefit Assessment page)
5. **Final Score**: Sum of all weighted scores, normalized to 0-100

## 🗄️ Database Schema

### Key Tables

**users**
- User accounts with authentication
- Roles and permissions

**change_requests**
- Core change request data
- `wizard_data` (JSON): Stores all form data from multi-step wizard
- `effort_score`, `benefit_score`: Calculated assessment scores
- Status, priority, risk tracking

**benefit_scoring_config**
- Configurable scoring parameters
- Fields: benefit_type, display_name, value_for_100_points, value_unit, time_decay_per_month

## 🌍 UK-Based Localization

- All currency displays use **£ (GBP)** instead of $
- Financial calculations respect UK locale

## 📁 Project Structure

```
change-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and environment config
│   │   ├── controllers/     # API controllers
│   │   │   ├── authController.ts
│   │   │   ├── changeController.ts
│   │   │   ├── metricsController.ts
│   │   │   └── benefitConfigController.ts
│   │   ├── middleware/      # Auth and error handling
│   │   ├── routes/          # API routes
│   │   ├── database/        # SQL schemas and seeds
│   │   │   ├── schema.sql
│   │   │   └── seed-all-benefit-configs.sql
│   │   └── index.ts         # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ChangeForm.tsx (multi-step wizard)
│   │   │   ├── MetricsDashboard.tsx
│   │   │   ├── BenefitAssessment.tsx
│   │   │   ├── EffortAssessment.tsx
│   │   │   ├── DependencyVisualization.tsx (Planning Board)
│   │   │   └── ...
│   │   ├── lib/             # Utilities
│   │   │   └── benefitCalculator.ts
│   │   ├── store/           # Zustand state management
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── QUICKSTART.md
```

## 🚦 Getting Started

### Quick Start (Recommended)

```bash
# Clone and enter project
cd change-management-system

# Install all dependencies
npm install

# Run both frontend and backend
npm run dev              # Local database
npm run dev:prod         # Production database (testing)
```

See [QUICKSTART.md](../QUICKSTART.md) for detailed setup instructions including:
1. Install MariaDB 12.1
2. Create database and run schema/seeds
3. Configure backend `.env` (database, JWT secret)
4. Configure frontend `.env` (API URL)
5. Create first admin user

## 🌍 Production Environment

- **Status:** ✅ Deployed and operational
- **Database:** MariaDB on private network
- **Environment Switching:** Seamlessly switch between local and production databases
- **Admin Access:** Contact team for production credentials (stored securely)
- **Documentation:**
  - [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Full deployment guide
  - [ENVIRONMENT_SWITCHING.md](ENVIRONMENT_SWITCHING.md) - How to switch environments
  - [PRE_PRODUCTION_CHECKLIST.md](PRE_PRODUCTION_CHECKLIST.md) - Deployment checklist

### Default Production Admin
- Email: admin@example.com
- Password: password123
- ⚠️ **Change password immediately after first login**

### Environment Switching
```bash
npm run dev       # Local development database (localhost)
npm run dev:prod  # Production database testing (read/write)
```

The console clearly shows which environment is active:
```
✅ MariaDB Connected [development] - localhost:3306/change_management
✅ MariaDB Connected [production] - [PROD_HOST]:3306/change_management
```

## 📝 API Endpoints

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
- `PUT /api/changes/:id/benefit-score` - Update benefit score

### Benefit Configuration
- `GET /api/benefit-config` - Get all configs
- `POST /api/benefit-config` - Create config
- `PUT /api/benefit-config/:id` - Update config

### Metrics
- `GET /api/metrics` - Get dashboard metrics

## 🔧 Development

The application runs in development mode with hot-reload:

**Backend:** Port 5000
**Frontend:** Port 5173

Environment variables are loaded from `.env` files in respective directories.

## 🎯 Validation & Data Quality

- **Form validation** using Zod schemas
- **Required fields** on benefit details prevent NaN scores
- **Type-safe** TypeScript throughout
- **Database constraints** ensure data integrity

## 📚 Documentation

- [QUICKSTART.md](../QUICKSTART.md) - Setup guide
- [DEBUG_PAGE_GUIDE.md](DEBUG_PAGE_GUIDE.md) - Debug page usage
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [FEATURES_CHECKLIST.md](FEATURES_CHECKLIST.md) - Feature tracking

## 🤝 Contributing

This is an internal project for Recycling Lives Group.

## 📄 License

Internal use only.

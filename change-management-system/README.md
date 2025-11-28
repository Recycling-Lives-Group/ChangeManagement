# Change Management System

A comprehensive full-stack Change Management application built with React, TypeScript, Node.js, Express, and MongoDB. This system implements a complete change management workflow with user authentication, approval workflows, real-time updates, and administrative capabilities.

## 🚀 Features

### Phase 1 (MVP) - Currently Implemented

- ✅ **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Requester, Coordinator, CAB Member, Department Head, Implementer, Admin)
  - User registration and login

- ✅ **Change Request Management**
  - Create, read, update, and delete change requests
  - Multi-step form with validation using React Hook Form and Zod
  - Change types: Emergency, Major, Minor, Standard
  - Status tracking: New, In Review, Approved, In Progress, Testing, Scheduled, Implementing, Completed, Failed, Cancelled, On Hold

- ✅ **Dashboard & Reporting**
  - User dashboard with personal change requests
  - Admin dashboard with organization-wide view
  - Real-time statistics and metrics
  - Status indicators with Lucide icons

- ✅ **Approval Workflow**
  - Multi-level approval system
  - Approve/Reject functionality
  - Comments and audit trail

### Phase 2 (Coming Soon)

- 🔄 Recommendation Engine with configurable weights
- 🔄 Advanced metrics and KPI dashboard
- 🔄 Communication system (Email, Slack integration)
- 🔄 File upload for attachments
- 🔄 Risk assessment calculator
- 🔄 Dependency tracking

### Phase 3 (Future)

- 📊 Advanced analytics and reporting
- 🤖 Process automation
- 🔗 External system integrations (Salesforce, JIRA, ServiceNow)
- 📱 Mobile app

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Hook Form + Zod** - Form handling and validation
- **React Router** - Routing
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates
- **date-fns** - Date formatting
- **React Hot Toast** - Notifications

### Backend
- **Node.js** with TypeScript
- **Express** - Web framework
- **MariaDB + mysql2** - Database (fully migrated from MongoDB)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **Zod** - Validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MariaDB** (v10.5 or higher) or **MySQL** (v8.0 or higher)
  - You can install MariaDB locally or use a managed database service

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd change-management-system
```

### 2. Install dependencies

This is a monorepo using npm workspaces. Install all dependencies from the root:

```bash
npm install
```

This will install dependencies for:
- Root workspace
- Frontend
- Backend
- Shared types

### 3. Set up environment variables

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=change_management
DB_USER=root
DB_PASSWORD=your-database-password

# Authentication
JWT_SECRET=your-very-secure-secret-key-change-this
JWT_EXPIRE=7d

# Email Configuration (optional for now)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

#### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Set up MariaDB

#### Option A: Local MariaDB

1. Install MariaDB from [mariadb.org](https://mariadb.org/download/)
2. Start MariaDB service:
   ```bash
   # Windows
   net start MariaDB

   # Linux/Mac
   sudo systemctl start mariadb
   ```
3. Create the database:
   ```bash
   mysql -u root -p
   CREATE DATABASE change_management;
   EXIT;
   ```
4. Update the database credentials in `backend/.env`

#### Option B: Managed Database Service

1. Use a managed service like AWS RDS, DigitalOcean, or PlanetScale
2. Create a MariaDB/MySQL instance
3. Get your connection credentials
4. Update `DB_HOST`, `DB_USER`, `DB_PASSWORD`, etc. in `backend/.env`

### 5. Build shared types

The shared types package needs to be built before starting the apps:

```bash
cd shared/types
npm run build
```

## 🚀 Running the Application

### Development Mode

You can run both frontend and backend simultaneously from the root directory:

```bash
npm run dev
```

Or run them separately:

#### Backend Only
```bash
npm run dev:backend
```

This starts the Express server on `http://localhost:5000`

#### Frontend Only
```bash
npm run dev:frontend
```

This starts the Vite dev server on `http://localhost:5173`

### Production Build

```bash
npm run build
```

This builds all workspaces for production.

## 📱 Using the Application

### 1. Register a New User

1. Navigate to `http://localhost:5173/register`
2. Fill in your details:
   - Full Name
   - Email
   - Department
   - Phone
   - Password
3. Click "Sign Up"

**Note:** The first user will be created as a "Requester". To test admin features, you'll need to manually update the user role in MariaDB:

```sql
-- In MariaDB/MySQL shell
USE change_management;
UPDATE users
SET role = 'Admin'
WHERE email = 'your-email@example.com';
```

### 2. Login

1. Navigate to `http://localhost:5173/login`
2. Enter your email and password
3. Click "Sign In"

### 3. Create a Change Request

1. Click "New Change Request" button on the dashboard
2. Fill in the form:
   - **Basic Information:** Title, Type, Risk Level, Justification
   - **Impact Assessment:** Systems affected, users, departments, financial impact
   - **Implementation Details:** Proposed date, rollback plan, testing plan, success criteria
3. Click "Submit Change Request"

### 4. View Change Requests

- **User Dashboard:** View your submitted change requests
- **Admin Dashboard:** View all change requests (Admin/Coordinator/CAB Member only)

### 5. Approve/Reject Changes (Admin/CAB Member only)

1. Click on a change request to view details
2. Click "Approve" or "Reject"
3. Add comments (required for rejection)

## 🔑 User Roles & Permissions

| Role | Create Request | View All | Approve | Modify Engine | Reports | Manage Users |
|------|---------------|----------|---------|---------------|---------|--------------|
| Requester | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Coordinator | ✅ | ✅ | L1 | ❌ | ✅ | ❌ |
| CAB Member | ✅ | ✅ | L1-L2 | ❌ | ✅ | ❌ |
| Dept Head | ✅ | ✅ | L1-L3 | ❌ | ✅ | ❌ |
| Implementer | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Admin | ✅ | ✅ | L1-L4 | ✅ | ✅ | ✅ |

## 📁 Project Structure

```
change-management-system/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── common/      # Layout, buttons, etc.
│   │   │   ├── forms/       # Form components
│   │   │   ├── dashboard/   # Dashboard widgets
│   │   │   └── admin/       # Admin components
│   │   ├── features/        # Feature-based modules
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Custom middleware
│   │   ├── config/          # Configuration
│   │   └── utils/           # Utility functions
│   └── package.json
├── shared/                  # Shared packages
│   └── types/               # Shared TypeScript types
└── package.json             # Root package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Change Requests
- `GET /api/changes` - List all changes (with filters)
- `GET /api/changes/:id` - Get specific change
- `POST /api/changes` - Create new change
- `PUT /api/changes/:id` - Update change
- `DELETE /api/changes/:id` - Cancel change
- `POST /api/changes/:id/approve` - Approve change (CAB/Admin only)
- `POST /api/changes/:id/reject` - Reject change (CAB/Admin only)

### Health Check
- `GET /api/health` - Server health status

## 🧪 Testing

```bash
# Run tests for all packages
npm test

# Run tests for specific package
npm test --workspace=backend
npm test --workspace=frontend
```

## 🐛 Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to MariaDB

**Solution:**
- Ensure MariaDB is running: `net start MariaDB` (Windows) or `sudo systemctl status mariadb` (Linux)
- Check your database credentials in `backend/.env` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- Verify the database exists: `SHOW DATABASES;`
- Check MariaDB is listening on port 3306: `netstat -an | find "3306"` (Windows)

### Port Already in Use

**Problem:** Port 5000 or 5173 is already in use

**Solution:**
- Change the port in `backend/.env` (PORT=5001)
- Change the port in `frontend/vite.config.ts`
- Update `VITE_API_URL` in `frontend/.env` accordingly

### Module Not Found Errors

**Problem:** Cannot find module '@cm/types'

**Solution:**
```bash
cd shared/types
npm run build
```

### Database Tables Not Created

**Problem:** Tables don't exist in database

**Solution:**
- The tables are created automatically when the backend starts
- Check the backend logs for any database sync errors
- Manually sync: `sequelize.sync({ force: true })` in development (WARNING: drops all data)

### Authentication Issues

**Problem:** Token expired or invalid

**Solution:**
- Clear localStorage in browser dev tools
- Log out and log in again
- Check JWT_SECRET is consistent in `backend/.env`

## 🛣️ Roadmap

### Phase 2 (Next)
- [ ] Prioritization engine with configurable weights
- [ ] Advanced metrics dashboard with charts
- [ ] File upload functionality
- [ ] Email notifications
- [ ] Risk assessment calculator
- [ ] Dependency visualization

### Phase 3 (Future)
- [ ] CAB meeting management
- [ ] Automated workflows
- [ ] Integration with external systems
- [ ] Mobile application
- [ ] Advanced reporting and analytics
- [ ] AI-powered insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## 🎉 Acknowledgments

- Built following ITIL Change Management best practices
- Inspired by RLS (Recycling Lives Services) change management procedures
- Icons by [Lucide](https://lucide.dev/)

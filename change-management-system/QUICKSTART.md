# Quick Start Guide

Get the Change Management System up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MariaDB or MySQL installed and running (or managed database service)

## Step 1: Install Dependencies

```bash
cd change-management-system
npm install
```

## Step 2: Build Shared Types

```bash
cd shared/types
npm run build
cd ../..
```

## Step 3: Configure Environment Variables

### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` - **At minimum, change these:**
- `JWT_SECRET` - Use a long random string
- `DB_USER` - Your database username (default: root)
- `DB_PASSWORD` - Your database password
- `DB_NAME` - Database name (default: change_management)

### Frontend Configuration

```bash
cd ../frontend
cp .env.example .env
```

The defaults should work if you're running locally.

## Step 4: Start MariaDB and Create Database

If using local MariaDB:
```bash
# Windows - Start MariaDB service
net start MariaDB

# Linux/Mac - Start MariaDB service
sudo systemctl start mariadb

# Create the database
mysql -u root -p
CREATE DATABASE change_management;
EXIT;
```

If using a managed database service, ensure your instance is running and accessible.

## Step 5: Start the Application

From the root directory:

```bash
npm run dev
```

This starts both frontend and backend!

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

## Step 6: Create Your First User

1. Navigate to http://localhost:5173/register
2. Fill in the registration form
3. Click "Sign Up"

## Step 7: Make Yourself an Admin (Optional)

To access admin features, update your role in MariaDB:

### Using MariaDB/MySQL Shell:
```bash
mysql -u root -p
USE change_management;
UPDATE users
SET role = 'Admin'
WHERE email = 'your-email@example.com';
SELECT name, email, role FROM users;
EXIT;
```

### Using MySQL Workbench or DBeaver:
1. Connect to localhost:3306
2. Open the "change_management" database
3. Browse the "users" table
4. Find your user and edit the "role" field to "Admin"

## Step 8: Create Your First Change Request

1. Log in at http://localhost:5173/login
2. Click "New Change Request"
3. Fill in the form
4. Submit!

## 🎉 You're Done!

Your Change Management System is now running. Check out the full README.md for more details.

## Common Issues

### "Cannot connect to database"
- Ensure MariaDB is running: `net start MariaDB` (Windows) or `sudo systemctl status mariadb` (Linux)
- Check database credentials in backend/.env (DB_USER, DB_PASSWORD, DB_NAME)
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### "Module not found: @cm/types"
- Build the shared types: `cd shared/types && npm run build`

### "Port 5000 already in use"
- Change PORT in backend/.env
- Update VITE_API_URL in frontend/.env

### "Table doesn't exist"
- Tables are created automatically when backend starts
- Check backend console for database sync errors

## Next Steps

- Explore the Dashboard
- Create multiple change requests
- Try different user roles (Coordinator, CAB_Member, etc.)
- Check out the Admin Dashboard
- Read the full documentation in README.md

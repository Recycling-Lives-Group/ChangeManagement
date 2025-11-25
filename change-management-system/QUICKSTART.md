# Quick Start Guide

Get the Change Management System up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)

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
- `MONGODB_URI` - Your MongoDB connection string

### Frontend Configuration

```bash
cd ../frontend
cp .env.example .env
```

The defaults should work if you're running locally.

## Step 4: Start MongoDB

If using local MongoDB:
```bash
mongod
```

If using MongoDB Atlas, make sure your cluster is running.

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

To access admin features, update your role in MongoDB:

### Using MongoDB Shell:
```bash
mongosh
use change-management
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "Admin" } }
)
```

### Using MongoDB Compass:
1. Connect to localhost:27017
2. Open the "change-management" database
3. Open the "users" collection
4. Find your user and edit the "role" field to "Admin"

## Step 8: Create Your First Change Request

1. Log in at http://localhost:5173/login
2. Click "New Change Request"
3. Fill in the form
4. Submit!

## 🎉 You're Done!

Your Change Management System is now running. Check out the full README.md for more details.

## Common Issues

### "Cannot connect to MongoDB"
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in backend/.env

### "Module not found: @cm/types"
- Build the shared types: `cd shared/types && npm run build`

### "Port 5000 already in use"
- Change PORT in backend/.env
- Update VITE_API_URL in frontend/.env

## Next Steps

- Explore the Dashboard
- Create multiple change requests
- Try different user roles (Coordinator, CAB_Member, etc.)
- Check out the Admin Dashboard
- Read the full documentation in README.md

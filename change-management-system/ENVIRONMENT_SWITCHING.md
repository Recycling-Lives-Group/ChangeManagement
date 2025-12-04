# Environment Switching Guide

This guide explains how to easily switch between **local development database** and **production database** for testing.

## Quick Start

### Local Development (Default)
```bash
cd backend
npm run dev
```
**Uses:** `.env` file → Local MariaDB (localhost)

### Production Testing
```bash
cd backend
npm run dev:prod
```
**Uses:** `.env.production` file → Production MariaDB (see .env.production for host)

## Environment Files

### 📁 `.env` (Local Development)
```env
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=RLSroot999
DB_NAME=change_management
```

### 📁 `.env.production` (Production Database)
```env
NODE_ENV=production
DB_HOST=[PRODUCTION_HOST]
DB_USER=[PRODUCTION_USER]
DB_PASSWORD=[PRODUCTION_PASSWORD]
DB_NAME=change_management
```

⚠️ **Actual credentials in file - not shown here for security**

⚠️ **Important:** Never commit `.env.production` to git!

## NPM Scripts Reference

| Command | Description | Database |
|---------|-------------|----------|
| `npm run dev` | Start development server | **Local** |
| `npm run dev:prod` | Start dev server with production DB | **Production** |
| `npm run build` | Build for production | N/A |
| `npm run start` | Start production server | Uses current `.env` |
| `npm run start:prod` | Start with production DB | **Production** |

## How It Works

### 1. dotenv-cli Package

The `dotenv-cli` package allows loading different `.env` files:

```bash
# Install (already in package.json)
npm install --save-dev dotenv-cli

# Use different env file
dotenv -e .env.production npm run dev
```

### 2. Updated database.ts

The database connection automatically:
- ✅ Shows which environment you're connected to
- ✅ Handles SSL certificate issues for production
- ✅ Displays connection details on startup

**Output examples:**
```
✅ MariaDB Connected [development] - localhost:3306/change_management
✅ MariaDB Connected [production] - [PROD_HOST]:3306/change_management
```

### 3. SSL Handling

Production database SSL certificate verification is automatically skipped when connecting to non-localhost:

```typescript
if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
  dbConfig.ssl = {
    rejectUnauthorized: false  // Skip SSL verification
  };
}
```

## Testing Workflows

### Test Feature Locally → Test on Production

```bash
# 1. Develop locally
npm run dev
# Test your changes with local data

# 2. Test against production data
npm run dev:prod
# Verify it works with production database

# 3. Deploy
npm run build
NODE_ENV=production npm start
```

### Quick Production Database Check

```bash
# Start backend connected to production
npm run dev:prod

# Backend will show:
# ✅ MariaDB Connected [production] - [PROD_HOST]:3306/change_management

# Now you can test:
# - Login with production users
# - View production change requests
# - Test scoring with production data
```

## Method 2: Manual .env Switching (Alternative)

If you prefer manual control:

```bash
# Save current local .env
cp .env .env.local

# Switch to production
cp .env.production .env

# Run normally
npm run dev

# Switch back to local
cp .env.local .env
```

## Method 3: Environment Variables (CLI)

Override specific variables without changing files:

```bash
# Temporary production connection
DB_HOST=[PROD_HOST] \
DB_USER=[PROD_USER] \
DB_PASSWORD=[PROD_PASSWORD] \
npm run dev
```

## Frontend Environment Switching

Frontend also needs different API URLs:

### 📁 `frontend/.env.local` (Development)
```env
VITE_API_URL=http://localhost:5000/api
```

### 📁 `frontend/.env.production` (Production)
```env
VITE_API_URL=https://yourdomain.com/api
```

**Usage:**
```bash
# Local development
npm run dev

# Build for production
npm run build
```

Vite automatically uses `.env.production` during `npm run build`.

## Safety Features

### ✅ Read-Only Production Testing

To safely test against production without risking data changes:

**Option 1:** Create read-only database user
```sql
CREATE USER 'cm_readonly'@'%' IDENTIFIED BY 'password';
GRANT SELECT ON change_management.* TO 'cm_readonly'@'%';
```

**Option 2:** Test specific endpoints only
- Use production for GET requests (read data)
- Use local for POST/PUT/DELETE (write operations)

### ⚠️ Warnings

The backend now logs connection details:
```
✅ MariaDB Connected [production] - [PROD_HOST]:3306/change_management
```

**Always check the log to confirm which database you're connected to!**

## Troubleshooting

### "dotenv-cli not found"
```bash
cd backend
npm install
```

### SSL Certificate Error
The database.ts already handles this automatically for non-localhost connections.

### Wrong Database Connected
Check the startup log:
```
✅ MariaDB Connected [development] - localhost:3306/change_management
```

### Environment Variables Not Loading
1. Check file exists: `ls -la .env.production`
2. Verify format (no spaces around `=`)
3. Try: `dotenv -e .env.production -p`

## Best Practices

1. **Default to Local**
   - Always use `npm run dev` for normal development
   - Use `npm run dev:prod` only when specifically testing production data

2. **Keep .env Files Separate**
   - ✅ `.env` - committed to git (with dummy values)
   - ✅ `.env.example` - template
   - ❌ `.env.production` - NEVER commit (has real credentials)

3. **Add to .gitignore**
   ```gitignore
   .env.production
   .env.local
   .env.*.local
   ```

4. **Document Credentials Securely**
   - Store production credentials in password manager
   - Share via secure channels only
   - Rotate passwords regularly

## Quick Reference Card

```bash
# ╔══════════════════════════════════════╗
# ║   BACKEND ENVIRONMENT SWITCHING      ║
# ╚══════════════════════════════════════╝

# 🏠 Local Development
npm run dev              # localhost DB

# 🌍 Production Testing
npm run dev:prod         # Production DB (see .env.production)

# 🔍 Check Connection
# Look for startup message:
# ✅ MariaDB Connected [environment] - host:port/database

# 📝 Edit Environment
nano .env                # Local config
nano .env.production     # Production config

# 🔄 Manual Switch (alternative)
cp .env.production .env  # Use production
cp .env.local .env       # Back to local
```

## Additional Configuration

### Add More Environments

Create additional environment files:

```bash
# Staging environment
.env.staging

# Testing environment
.env.test

# Update package.json
"scripts": {
  "dev:staging": "dotenv -e .env.staging tsx watch src/index.ts",
  "dev:test": "dotenv -e .env.test tsx watch src/index.ts"
}
```

### Database Connection Pooling

Different pool sizes for different environments:

```typescript
// In database.ts
const connectionLimit = process.env.NODE_ENV === 'production' ? 20 : 10;

const dbConfig = {
  // ...
  connectionLimit,
  // ...
};
```

---

**Quick Setup:**
```bash
# 1. Install dependencies
cd backend && npm install

# 2. Verify env files exist
ls -la .env*

# 3. Test local connection
npm run dev

# 4. Test production connection
npm run dev:prod
```

**You're ready to switch environments! 🚀**

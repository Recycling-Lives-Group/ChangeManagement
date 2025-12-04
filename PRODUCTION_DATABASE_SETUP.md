# Production Database Setup - Complete ✅

**Date:** 2025-12-04
**Database Server:** [REDACTED]
**Database Name:** change_management

## Connection Details

- **Host:** [REDACTED - See .env.production]
- **Port:** 3306 (default)
- **Username:** [REDACTED - See .env.production]
- **Password:** [REDACTED - See .env.production]
- **Database:** change_management
- **SSL:** Skip SSL (`--skip-ssl` flag required due to certificate verification issues)

⚠️ **IMPORTANT:** Production credentials are stored in `backend/.env.production` which is NOT committed to git.

## Setup Completed

### 1. ✅ Database Schema Installed

All tables created successfully:
- ✅ users
- ✅ change_requests (with all scoring fields)
- ✅ benefit_scoring_config ⭐ (newly created)
- ✅ effort_scoring_config ⭐ (newly created)
- ✅ cab_reviews
- ✅ change_history
- ✅ change_comments
- ✅ change_attachments
- ✅ notifications

**Total: 9 tables**

### 2. ✅ Scoring System Configured

**change_requests table includes:**
- `wizard_data` (JSON) - Change request wizard responses
- `risk_score` (INT) - Calculated risk score 0-100
- `risk_level` (VARCHAR) - Low, Medium, High, Critical
- `risk_calculated_at` (TIMESTAMP)
- `risk_calculated_by` (INT FK)
- `effort_score` (INT) ⭐ - Calculated effort score 0-100
- `benefit_score` (INT) ⭐ - Calculated benefit score 0-100
- `effort_calculated_at` (TIMESTAMP) ⭐
- `benefit_calculated_at` (TIMESTAMP) ⭐
- `effort_factors` (JSON) - Individual effort factor breakdown
- `benefit_factors` (JSON) - Individual benefit factor breakdown

### 3. ✅ Benefit Scoring Configuration Seeded

6 benefit types configured with scoring formulas:

| Benefit Type | Max Value for 100pts | Unit | Time Decay |
|--------------|---------------------|------|------------|
| Revenue Improvement | £100,000 | GBP | -5 pts/month |
| Cost Savings | £80,000 | GBP | -4 pts/month |
| Customer Impact | 10,000 | customers | -3 pts/month |
| Process Improvement | 100% | percentage | -2 pts/month |
| Internal QoL | 500 | employees | -2 pts/month |
| Strategic Alignment | 10 | scale | No decay |

### 4. ✅ Environment Configuration

**Backend .env.production created** with production database credentials:
- File: `backend/.env.production`
- ⚠️ **NOT committed to git** (contains sensitive credentials)
- Ready to use for production deployment

**Connection string:**
```bash
mysql -h [HOST] -u [USERNAME] -p'[PASSWORD]' --skip-ssl change_management
```

See `backend/.env.production` for actual credentials (not in git).

## Database Statistics

- **Tables:** 9
- **Users:** 0 (no users created yet)
- **Change Requests:** 0
- **Benefit Configurations:** 6 ✅

## Next Steps

### 1. Create First Admin User

**Option A: Via MySQL directly**
```sql
-- Generate bcrypt hash for password first (use online tool or Node.js bcrypt)
-- Example password: "Admin123!"

INSERT INTO users (
  email, username, password_hash,
  first_name, last_name, role,
  department, is_active
) VALUES (
  'admin@yourdomain.com',
  'admin',
  '$2b$10$YOUR_BCRYPT_HASH_HERE',
  'System',
  'Administrator',
  'admin',
  'IT',
  1
);
```

**Option B: Via API after deployment**
```bash
# 1. Register first user
curl -X POST http://your-server/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "username": "admin",
    "password": "Admin123!",
    "firstName": "System",
    "lastName": "Administrator",
    "department": "IT",
    "phone": "0123456789"
  }'

# 2. Update user to admin role via MySQL
mysql -h [DB_HOST] -u [DB_USER] -p'[DB_PASSWORD]' --skip-ssl change_management \
  -e "UPDATE users SET role='admin' WHERE email='admin@yourdomain.com';"
```

### 2. Deploy Backend Application

Update backend `.env` file on production server:
```env
NODE_ENV=production
DB_HOST=[PRODUCTION_DB_HOST]
DB_PORT=3306
DB_USER=[PRODUCTION_DB_USER]
DB_PASSWORD=[PRODUCTION_DB_PASSWORD]
DB_NAME=change_management
JWT_SECRET=[YOUR_JWT_SECRET_64_CHARS]
FRONTEND_URL=http://your-production-domain.com
```

Copy from `backend/.env.production` template (not in git).

### 3. Configure Node.js MySQL Connection

The backend MySQL connection needs to handle the SSL certificate issue. Update database connection in `backend/src/config/database.ts`:

```typescript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false  // Add this to skip SSL cert verification
  }
});
```

### 4. Test Database Connection from Backend

```bash
cd backend
npm run build
node dist/index.js
```

Watch for successful database connection message in logs.

## Security Notes

⚠️ **IMPORTANT:**

1. **Credentials stored in `.env.production`** - Do NOT commit this file to git
2. **Database credentials:** Stored securely in `backend/.env.production` (not in version control)
3. **Database is on private network:** Ensure firewall allows access only from authorized IPs
4. **SSL certificate issue:** Currently using `--skip-ssl` - consider fixing SSL certificate for production
5. **JWT Secret:** Keep the existing JWT secret secure and never commit to git
6. **Access Control:** Share production credentials only via secure channels (password manager, encrypted chat)

## Backup Configuration

Setup automated daily backups:

```bash
# Create backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/cm-database"
mkdir -p $BACKUP_DIR

# Use credentials from .env.production
mysqldump -h [DB_HOST] -u [DB_USER] -p'[DB_PASSWORD]' \
  --skip-ssl change_management | gzip > $BACKUP_DIR/cm_backup_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "cm_backup_*.sql.gz" -mtime +30 -delete
```

## Database Verification

To verify production database at any time (use credentials from `.env.production`):

```bash
# Show all tables
mysql -h [DB_HOST] -u [DB_USER] -p'[DB_PASSWORD]' \
  --skip-ssl change_management -e "SHOW TABLES;"

# Check change_requests structure
mysql -h [DB_HOST] -u [DB_USER] -p'[DB_PASSWORD]' \
  --skip-ssl change_management -e "DESCRIBE change_requests;"

# Get statistics
mysql -h [DB_HOST] -u [DB_USER] -p'[DB_PASSWORD]' \
  --skip-ssl change_management -e "
    SELECT 'Users' as item, COUNT(*) as count FROM users
    UNION ALL SELECT 'Change Requests', COUNT(*) FROM change_requests
    UNION ALL SELECT 'Benefit Configs', COUNT(*) FROM benefit_scoring_config;"
```

## Troubleshooting

### SSL Certificate Error
**Error:** `TLS/SSL error: Certificate verification failure`
**Solution:** Use `--skip-ssl` flag with mysql command

### Connection Refused
**Error:** `Can't connect to MySQL server`
**Solution:**
- Check firewall allows connection from your IP to production DB server
- Verify database server is running
- Confirm credentials are correct in `.env.production`

### Missing Tables
**Error:** `Table doesn't exist`
**Solution:** Re-run schema setup (use credentials from `.env.production`):
```bash
mysql -h [DB_HOST] -u [DB_USER] -p'[DB_PASSWORD]' \
  --skip-ssl change_management < backend/src/database/schema.sql
```

## Migration History Applied

The following migrations were applied to production:

1. ✅ `schema.sql` - Base schema (users, change_requests, cab_reviews, etc.)
2. ✅ `CREATE TABLE benefit_scoring_config` - Benefit scoring configuration table
3. ✅ `CREATE TABLE effort_scoring_config` - Effort scoring configuration table
4. ✅ `add-risk-fields.sql` - Risk assessment fields
5. ✅ `add-assessment-scores.sql` - Effort and benefit score fields
6. ✅ `add-effort-benefit-factors.sql` - JSON factor breakdown fields
7. ✅ `seed-all-benefit-configs.sql` - Benefit scoring seed data

## Schema Export for Reference

To export current production schema for documentation:

```bash
mysqldump -h [DB_HOST] -u [DB_USER] -p'[DB_PASSWORD]' \
  --skip-ssl --no-data change_management > schema_production_backup.sql
```

---

**Status:** ✅ **PRODUCTION DATABASE READY**
**Last Updated:** 2025-12-04 10:52 UTC
**Next Step:** Deploy backend application and create first admin user

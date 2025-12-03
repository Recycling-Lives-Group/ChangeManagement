# Change Management System - Database Migration Guide

## Overview
This guide explains how to migrate the Change Management database schema from your local MariaDB to an internal server without transferring any existing data.

## Files Generated
- `change_management_schema.sql` - Complete database schema (tables, indexes, constraints)
- `change_management_configs.sql` - Scoring configuration data (required for system to function)

## Migration Steps

### 1. On Your Internal Server

#### A. Create the Database
```sql
CREATE DATABASE change_management CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci;
```

#### B. Import the Schema
```bash
mysql -u [username] -p change_management < change_management_schema.sql
```

Or if using MariaDB client:
```bash
"C:\Program Files\MariaDB 12.1\bin\mysql.exe" -u [username] -p -h [server_ip] change_management < change_management_schema.sql
```

#### C. Import Configuration Data
```bash
mysql -u [username] -p change_management < change_management_configs.sql
```

### 2. Create Initial Admin User

After importing the schema, you'll need to create at least one admin user:

```sql
USE change_management;

INSERT INTO users (
  email,
  name,
  password_hash,
  role,
  department,
  phone
) VALUES (
  'admin@yourcompany.com',
  'System Administrator',
  '$2b$10$YourHashedPasswordHere',  -- Generate using bcrypt
  'admin',
  'IT',
  '0000000000'
);
```

**Important:** Use bcrypt to hash the password before inserting. You can use Node.js:
```javascript
const bcrypt = require('bcrypt');
const password = 'your-secure-password';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

### 3. Update Backend Configuration

Update your backend `.env` file to point to the new database:

```env
DB_HOST=your-internal-server-ip
DB_PORT=3306
DB_NAME=change_management
DB_USER=your-db-username
DB_PASSWORD=your-db-password
```

### 4. Verify Migration

Run these checks on the new server:

```sql
-- Check all tables exist
SHOW TABLES;

-- Verify benefit scoring configs
SELECT benefit_type, display_name FROM benefit_scoring_config;

-- Verify effort scoring configs
SELECT effort_type, display_name FROM effort_scoring_config;

-- Check user exists
SELECT id, email, role FROM users;
```

## Database Schema Overview

### Core Tables
- **users** - User accounts and authentication
- **change_requests** - Main change request records
- **cab_reviews** - CAB review assessments
- **change_comments** - Comments on change requests
- **change_attachments** - File attachments
- **change_history** - Audit trail
- **notifications** - User notifications
- **diagram_state** - Workflow diagram state

### Configuration Tables
- **benefit_scoring_config** - Benefit scoring parameters (7 factors)
- **effort_scoring_config** - Effort scoring parameters (8 factors)

### Key Fields in change_requests
- `wizard_data` - User input + CAB-revised values (JSON)
- `benefit_score` - Calculated benefit score (0-100)
- `benefit_factors` - Detailed benefit factor breakdown (JSON)
- `effort_score` - Calculated effort score (0-100)
- `effort_factors` - Detailed effort factor breakdown (JSON)
- `risk_score` - Risk assessment score
- `risk_level` - Risk level (low/medium/high/critical)

## Post-Migration Testing

1. **Login Test**
   - Verify you can log in with the admin account
   - Check user role permissions

2. **Configuration Check**
   - Navigate to Benefit Scoring Config page
   - Navigate to Effort Scoring Config page
   - Verify all 7 benefit factors display
   - Verify all 8 effort factors display

3. **Create Test Change Request**
   - Submit a new change request through the wizard
   - Review it through CAB Review Wizard
   - Approve it and verify benefit/effort scores calculate
   - Check it appears on Benefit Assessment page in correct matrix quadrant

4. **Schedule Test**
   - Navigate to Change Calendar
   - Schedule the approved change
   - Verify it appears on the calendar

## Rollback Plan

If migration fails, you can:
1. Drop the database: `DROP DATABASE change_management;`
2. Fix any issues
3. Re-run the import commands

## Troubleshooting

### Issue: Import fails with "Access denied"
**Solution:** Ensure your database user has CREATE, INSERT, ALTER privileges

### Issue: Config data not importing
**Solution:** First import schema, then import configs. Configs depend on tables existing.

### Issue: Cannot create admin user
**Solution:** Check password hash is valid bcrypt format. Must start with `$2b$` or `$2a$`

### Issue: Foreign key errors
**Solution:** Ensure you're importing into a clean database. Drop and recreate if needed.

## Important Notes

- **Character Set:** Database uses `utf8mb4` for full Unicode support
- **Time Zones:** All timestamps stored in UTC
- **JSON Columns:** Several columns store JSON data (`wizard_data`, `benefit_factors`, etc.)
- **Enums:** Status and role fields use ENUM types - ensure your MariaDB version supports them
- **Version:** Tested on MariaDB 12.1.2 but should work on 10.5+

## Security Recommendations

1. Use strong passwords for database users
2. Restrict database access to application server IPs only
3. Enable SSL/TLS for database connections
4. Regularly backup the database
5. Set up automated backups on the internal server

## Support

If you encounter issues:
1. Check MariaDB error logs
2. Verify all tables were created: `SHOW TABLES;`
3. Check for foreign key issues: `SHOW ENGINE INNODB STATUS;`
4. Ensure character set matches: `SHOW CREATE DATABASE change_management;`

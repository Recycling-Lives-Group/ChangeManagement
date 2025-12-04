# Change Management System - Administrator Guide

**For:** System Administrators
**Version:** 1.0
**Last Updated:** 2025-12-04

---

## 📖 Table of Contents

1. [Administrator Overview](#administrator-overview)
2. [User Management](#user-management)
3. [Scoring Configuration](#scoring-configuration)
4. [System Maintenance](#system-maintenance)
5. [Database Administration](#database-administration)
6. [Troubleshooting](#troubleshooting)
7. [Security & Access Control](#security--access-control)

---

## Administrator Overview

### Admin Responsibilities

As a system administrator, you can:

✅ Create, edit, and delete user accounts
✅ Assign user roles and permissions
✅ Configure benefit and effort scoring formulas
✅ View all change requests (organization-wide)
✅ Override decisions if necessary
✅ Access system settings and configurations
✅ Monitor system health and performance
✅ Manage database backups
✅ Switch between development and production environments

### Admin Access

**Default Admin Account:**
- Email: admin@example.com
- Password: password123

⚠️ **CRITICAL:** Change this password immediately after first login!

**To create additional admins:**
```sql
UPDATE users SET role='admin' WHERE email='user@example.com';
```

---

## User Management

### Creating New Users

#### Option 1: Self-Registration (Recommended for Users)

1. Users navigate to registration page
2. Users fill in:
   - Email address
   - Password
   - First name
   - Last name
   - Department
3. Account created with default **"user"** role
4. Admin updates role if needed

#### Option 2: Direct Database Creation (For Admins)

```sql
-- Create user with specific role
INSERT INTO users (email, username, password_hash, first_name, last_name, role, department, is_active)
VALUES (
  'john.doe@company.com',
  'johndoe',
  '$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC',  -- password123
  'John',
  'Doe',
  'cab_member',
  'IT',
  1
);
```

**Password Hash Generation:**
Use bcrypt with cost factor 10. Default hash shown above = "password123"

**To generate new hash:**
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('newpassword', 10);
console.log(hash);
```

### User Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **user** | Create & view own requests | Regular employees |
| **manager** | Review team requests, approve low-risk | Department managers |
| **cab_member** | Review all requests in CAB | CAB committee members |
| **admin** | Full system access | System administrators |

### Updating User Roles

```sql
-- Make user a manager
UPDATE users SET role='manager' WHERE email='user@example.com';

-- Make user a CAB member
UPDATE users SET role='cab_member' WHERE email='user@example.com';

-- Make user an admin
UPDATE users SET role='admin' WHERE email='user@example.com';

-- Verify role change
SELECT email, role FROM users WHERE email='user@example.com';
```

### Deactivating Users

```sql
-- Soft delete (recommended)
UPDATE users SET is_active=0 WHERE email='former.employee@example.com';

-- Hard delete (use with caution)
DELETE FROM users WHERE email='former.employee@example.com';
```

⚠️ **Note:** Hard deletes may break referential integrity if user has change requests.

### Listing All Users

```sql
-- View all active users
SELECT id, email, username, role, first_name, last_name, department, created_at
FROM users
WHERE is_active=1
ORDER BY role, last_name;

-- Count users by role
SELECT role, COUNT(*) as count
FROM users
WHERE is_active=1
GROUP BY role;
```

---

## Scoring Configuration

### Benefit Scoring Configuration

The system uses database-driven scoring formulas stored in `benefit_scoring_config` table.

#### View Current Configuration

```sql
SELECT * FROM benefit_scoring_config WHERE is_active=1;
```

#### Understanding Benefit Scoring

**Formula:**
```
Benefit Score = (actual_value / value_for_100_points) × 100
Timeline Score = 100 - (months_until_benefit × time_decay_per_month)
Combined = Benefit Score + Timeline Score
```

**Example: Revenue Improvement**
- User enters: £50,000 annual revenue, 6 months until realized
- value_for_100_points: £100,000
- time_decay_per_month: 5 points

**Calculation:**
```
Benefit Score = (50,000 / 100,000) × 100 = 50 points
Timeline Score = 100 - (6 × 5) = 70 points
Combined = 50 + 70 = 120 points (normalized to 0-100 scale)
```

#### Current Benefit Types

| Benefit Type | Value for 100pts | Unit | Time Decay | Description |
|--------------|------------------|------|------------|-------------|
| revenueImprovement | £100,000 | GBP | 5pts/month | Annual revenue improvement |
| costSavings | £80,000 | GBP | 4pts/month | Annual cost savings |
| customerImpact | 10,000 | customers | 3pts/month | Number of customers impacted |
| processImprovement | 100% | percentage | 2pts/month | Efficiency improvement |
| internalQoL | 500 | employees | 2pts/month | Employees positively impacted |
| strategicAlignment | 10 | scale | 0pts/month | Strategic alignment score (1-10) |

#### Updating Benefit Configuration

```sql
-- Update revenue threshold
UPDATE benefit_scoring_config
SET value_for_100_points = 120000.00,
    description = 'Annual revenue improvement in £. £120,000 = 100 points.'
WHERE benefit_type = 'revenueImprovement';

-- Update time decay
UPDATE benefit_scoring_config
SET time_decay_per_month = 6
WHERE benefit_type = 'costSavings';

-- Deactivate a benefit type
UPDATE benefit_scoring_config
SET is_active = 0
WHERE benefit_type = 'strategicAlignment';
```

**⚠️ Note:** Changes affect new calculations immediately. Existing scores are not recalculated.

#### Adding New Benefit Types

```sql
INSERT INTO benefit_scoring_config
  (benefit_type, display_name, value_for_100_points, value_unit, time_decay_per_month, description, is_active)
VALUES
  ('riskReduction', 'Risk Reduction', 100.00, 'percentage', 3,
   'Reduction in operational risk. 100% risk elimination = 100 points. Timeline: 3 points deducted per month delay.', 1);
```

### Effort Scoring Configuration

Similar to benefit scoring but stored in `effort_scoring_config` table.

#### View Current Configuration

```sql
SELECT * FROM effort_scoring_config WHERE is_active=1;
```

#### Current Effort Types

| Effort Type | Value for 100pts | Unit | Description |
|-------------|------------------|------|-------------|
| hoursEstimated | 1000 | hours | Estimated hours to complete |
| costEstimated | £50,000 | GBP | Estimated financial cost |
| resourceRequirement | 10 | people | Number of people required |
| complexity | 10 | scale | Technical complexity (1-10) |
| systemsAffected | 5 | systems | Number of systems impacted |
| testingRequired | 10 | scale | Testing level (1-10) |
| documentationRequired | 10 | scale | Documentation level (1-10) |
| urgency | 10 | scale | Time sensitivity (1-10) |

#### Updating Effort Configuration

```sql
-- Update cost threshold
UPDATE effort_scoring_config
SET value_for_100_points = 75000.00
WHERE effort_type = 'costEstimated';

-- Update complexity scale
UPDATE effort_scoring_config
SET description = 'Technical complexity on 1-10 scale. 10 = extremely complex = 100 points.'
WHERE effort_type = 'complexity';
```

---

## System Maintenance

### Regular Maintenance Tasks

#### Daily
- ✅ Monitor system logs for errors
- ✅ Check database backup status
- ✅ Review failed login attempts

#### Weekly
- ✅ Review pending change requests
- ✅ Check disk space usage
- ✅ Verify database connection pool health

#### Monthly
- ✅ Review user accounts (deactivate former employees)
- ✅ Analyze system usage metrics
- ✅ Test database restore procedure
- ✅ Update documentation if processes changed

### Monitoring System Health

**Check Backend Status:**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# View recent logs
pm2 logs cm-backend --lines 50

# Check backend process status
pm2 status
```

**Check Database:**
```sql
-- Check database size
SELECT
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'change_management'
ORDER BY (data_length + index_length) DESC;

-- Check table row counts
SELECT
  'users' as table_name, COUNT(*) as rows FROM users
UNION ALL
SELECT 'change_requests', COUNT(*) FROM change_requests
UNION ALL
SELECT 'cab_reviews', COUNT(*) FROM cab_reviews;
```

### Backup & Restore

#### Automated Backups

Backups run daily at 2 AM (if configured). Location: `/var/backups/cm-database/`

**Check backup status:**
```bash
ls -lh /var/backups/cm-database/ | tail -10
```

#### Manual Backup

**Local Database:**
```bash
mysqldump -u root -p change_management | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Production Database:**
```bash
mysqldump -h [PROD_HOST] -u change_management -p --skip-ssl change_management | gzip > prod_backup_$(date +%Y%m%d).sql.gz
```

#### Restore from Backup

```bash
# Decompress and restore
gunzip < backup_20251204.sql.gz | mysql -u root -p change_management

# Or restore directly from gzipped file
zcat backup_20251204.sql.gz | mysql -u root -p change_management
```

**⚠️ WARNING:** Restoring overwrites existing data. Always backup current state first!

### Database Cleanup

```sql
-- Remove old change history (keep last 12 months)
DELETE FROM change_history
WHERE created_at < DATE_SUB(NOW(), INTERVAL 12 MONTH);

-- Archive completed changes older than 2 years
UPDATE change_requests
SET status = 'archived'
WHERE status = 'completed'
  AND completed_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);
```

---

## Database Administration

### Database Connection

**Local Development:**
```bash
mysql -u root -p change_management
```

**Production:**
```bash
mysql -h [PROD_HOST] -u change_management -p --skip-ssl change_management
```

### Useful Queries

#### System Statistics

```sql
-- Overview
SELECT
  (SELECT COUNT(*) FROM users WHERE is_active=1) as active_users,
  (SELECT COUNT(*) FROM change_requests) as total_changes,
  (SELECT COUNT(*) FROM change_requests WHERE status='submitted') as pending_changes,
  (SELECT COUNT(*) FROM change_requests WHERE status='approved') as approved_changes,
  (SELECT COUNT(*) FROM change_requests WHERE status='completed') as completed_changes;
```

#### Recent Activity

```sql
-- Last 10 change requests
SELECT request_number, title, status, created_at, requester_id
FROM change_requests
ORDER BY created_at DESC
LIMIT 10;

-- Most active users
SELECT
  u.email,
  u.first_name,
  u.last_name,
  COUNT(cr.id) as request_count
FROM users u
LEFT JOIN change_requests cr ON u.id = cr.requester_id
GROUP BY u.id
ORDER BY request_count DESC
LIMIT 10;
```

#### Scoring Analysis

```sql
-- Average scores by status
SELECT
  status,
  COUNT(*) as count,
  ROUND(AVG(benefit_score), 2) as avg_benefit,
  ROUND(AVG(effort_score), 2) as avg_effort
FROM change_requests
WHERE benefit_score IS NOT NULL
  AND effort_score IS NOT NULL
GROUP BY status;
```

### Database Schema Updates

When schema needs updates:

1. **Backup database first!**
2. Test changes on development database
3. Document changes in migration file
4. Apply to production during maintenance window

**Example migration:**
```sql
-- Add new column
ALTER TABLE change_requests
ADD COLUMN priority_override TINYINT(1) DEFAULT 0
COMMENT 'Admin can override calculated priority';

-- Verify
DESCRIBE change_requests;
```

---

## Troubleshooting

### Common Issues

#### Users Can't Login

**Check:**
1. Is user account active?
   ```sql
   SELECT email, is_active FROM users WHERE email='user@example.com';
   ```
2. Has password been reset recently?
3. Is backend server running?
   ```bash
   pm2 status cm-backend
   ```

**Fix:**
```sql
-- Reactivate account
UPDATE users SET is_active=1 WHERE email='user@example.com';

-- Reset password to "password123"
UPDATE users
SET password_hash='$2a$10$mVBGN.cyLvYHUJsVeRFCy.0Fbgju4BdhOrbGW9Tj.ZaolEMnbQ.DC'
WHERE email='user@example.com';
```

#### Scoring Not Working

**Check:**
1. Are scoring configs active?
   ```sql
   SELECT COUNT(*) FROM benefit_scoring_config WHERE is_active=1;
   SELECT COUNT(*) FROM effort_scoring_config WHERE is_active=1;
   ```
2. Do change requests have wizard_data?
   ```sql
   SELECT id, wizard_data IS NOT NULL as has_data
   FROM change_requests
   WHERE id = [CHANGE_ID];
   ```

**Fix:**
```sql
-- Reseed scoring configs
SOURCE backend/src/database/seed-all-benefit-configs.sql;
```

#### Database Connection Errors

**Check environment:**
```bash
# Which environment are you connected to?
npm run dev       # Should show: [development] - localhost
npm run dev:prod  # Should show: [production] - [PROD_HOST]
```

**Verify credentials:**
```bash
# Test connection manually
mysql -h localhost -u root -p change_management
mysql -h [PROD_HOST] -u change_management -p --skip-ssl change_management
```

#### Production Data Not Showing

**Verify environment:**
1. Check `.env.production` file exists in backend/
2. Running with: `npm run dev:prod`?
3. Check console for connection confirmation

---

## Security & Access Control

### Security Best Practices

#### Passwords

- ✅ Change default admin password immediately
- ✅ Enforce strong passwords (minimum 8 characters, mix of upper/lower/numbers)
- ✅ Rotate admin passwords quarterly
- ✅ Never share admin credentials
- ✅ Use unique passwords per environment (dev/prod)

#### Database Access

- ✅ Use separate DB users for dev and production
- ✅ Grant minimum required privileges
- ✅ Never use root account in production
- ✅ Restrict production DB access to specific IPs
- ✅ Keep `.env` files out of version control

#### Credential Storage

**Local Development:**
- Store in `backend/.env` (gitignored)

**Production:**
- Store in `backend/.env.production` (gitignored)
- Share via secure password manager (e.g., LastPass, 1Password)
- Never email or chat credentials in plain text

#### Audit Logging

```sql
-- Check user activity
SELECT
  u.email,
  cr.request_number,
  cr.title,
  cr.status,
  cr.created_at
FROM change_requests cr
JOIN users u ON cr.requester_id = u.id
WHERE cr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY cr.created_at DESC;
```

### Access Control

#### Granting Production Access

When new team member needs production access:

1. Create user account (use self-registration)
2. Assign appropriate role via SQL
3. Provide production environment credentials securely
4. Document access in team wiki/documentation
5. Add to backup notification list

#### Revoking Access

When team member leaves:

1. Deactivate user account
   ```sql
   UPDATE users SET is_active=0 WHERE email='former@example.com';
   ```
2. Review their change requests (reassign if needed)
3. Remove from production server access
4. Update firewall rules if using IP whitelist
5. Rotate shared passwords

---

## Production Environment

### Production Details

- **Database Host:** See `.env.production` (credentials secured)
- **Admin Account:** admin@example.com / password123 (change immediately!)
- **Deployment Guide:** [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
- **Environment Switching:** [ENVIRONMENT_SWITCHING.md](ENVIRONMENT_SWITCHING.md)

### Switching Environments

**Development (Local):**
```bash
npm run dev
```

**Production Testing:**
```bash
npm run dev:prod
```

Console will show active environment:
```
✅ MariaDB Connected [development] - localhost:3306/change_management
✅ MariaDB Connected [production] - [PROD_HOST]:3306/change_management
```

### Production Deployment

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete deployment procedures.

---

## Additional Resources

### Documentation

- **[USER_GUIDE.md](USER_GUIDE.md)** - For end users
- **[QUICKSTART.md](../QUICKSTART.md)** - Quick setup guide
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development guide
- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Deployment procedures
- **[ENVIRONMENT_SWITCHING.md](ENVIRONMENT_SWITCHING.md)** - Environment switching

### Support

**For urgent production issues:**
- Check backend logs: `pm2 logs cm-backend`
- Check database status: `sudo systemctl status mariadb`
- Contact: System Administrator on-call

---

**System Version:** 1.0
**Last Updated:** 2025-12-04
**Maintained By:** System Administrator Team

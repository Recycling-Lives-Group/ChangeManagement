# Pre-Production Deployment Checklist

## ✅ Completed Items

### Code Quality
- ✅ **No TODO/FIXME/PLACEHOLDER comments** - All code is production-ready
- ✅ **No hardcoded localhost references** - All URLs use environment variables
- ✅ **All pages have routes** - No orphaned page components
- ✅ **Invalid files removed** - Deleted `frontend/src/pages/nul` file

### Environment Configuration
- ✅ **Backend .env.example** exists with all required variables
- ✅ **Frontend .env.example** exists with API URL configuration
- ✅ **Database credentials** use environment variables
- ✅ **JWT secret** uses environment variable

### Database
- ✅ **Schema complete** - All tables defined in `schema.sql`
- ✅ **Scoring tables** - `benefit_scoring_config` and `effort_scoring_config` tables exist
- ✅ **Seed data** - `seed-all-benefit-configs.sql` ready for deployment
- ✅ **JSON storage** - `wizard_data`, `benefit_factors`, `effort_factors` columns present

### Documentation
- ✅ **README.md** - Up-to-date with current features
- ✅ **QUICKSTART.md** - Complete setup instructions
- ✅ **DEVELOPMENT.md** - Development guide exists
- ✅ **FEATURES_CHECKLIST.md** - Feature tracking document
- ✅ **PRODUCTION_DEPLOYMENT.md** - New comprehensive deployment guide
- ✅ **PRE_PRODUCTION_CHECKLIST.md** - This file

## ⚠️ Optional Cleanup Items

### Unused Files (Alternate Versions)
These files exist but are not used in production. **Decision needed:**

1. **[ChangeDetail.tsx](frontend/src/pages/ChangeDetail.tsx)** (92 lines)
   - Unused - App.tsx imports `ChangeDetailFull.tsx` instead
   - Safe to delete

2. **[ChangeDetailSimple.tsx](frontend/src/pages/ChangeDetailSimple.tsx)** (90 lines)
   - Alternate simpler version
   - Safe to delete

3. **[DashboardSimple.tsx](frontend/src/pages/DashboardSimple.tsx)** (190 lines)
   - Alternate simpler version
   - Safe to delete

4. **[backend/check-changes.js](backend/check-changes.js)**
   - Development script for checking database
   - Safe to delete (not used in production)

### Development-Only Routes
**Decision needed: Should debug route be removed from production?**

Location: [App.tsx:247-257](frontend/src/App.tsx#L247-L257)
```typescript
{/* Debug Route - Development Only */}
<Route
  path="/debug/changes/:id"
  element={
    isAuthenticated ? (
      <ChangeRequestDebug />
    ) : (
      <Navigate to="/login" />
    )
  }
/>
```

**Options:**
1. Remove route entirely for production
2. Add role check (admin only)
3. Keep as-is (currently accessible to all authenticated users)

## 🔧 Configuration Required Before Deployment

### 1. Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_PORT=3306
DB_USER=cmapp
DB_PASSWORD=YOUR_STRONG_PASSWORD
DB_NAME=change_management
JWT_SECRET=YOUR_GENERATED_SECRET_64_CHARS
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://yourdomain.com/api
```

### 2. Database Setup

Execute in order:
1. Create database and user
2. Run `schema.sql`
3. Run `seed-all-benefit-configs.sql`
4. Create first admin user

### 3. SSL Certificate

- Obtain SSL certificate for production domain
- Configure Nginx/Apache with SSL

### 4. Firewall Rules

- Port 22 (SSH) - restricted to admin IPs
- Port 80 (HTTP) - redirect to HTTPS
- Port 443 (HTTPS) - open
- Port 3306 (MySQL) - localhost only

## 📊 Production Readiness Status

| Category | Status | Notes |
|----------|--------|-------|
| Code Quality | ✅ Ready | No placeholders, clean code |
| Environment Config | ✅ Ready | All using env vars |
| Database Schema | ✅ Ready | Complete schema with seed data |
| Documentation | ✅ Ready | Comprehensive guides created |
| Security | ⚠️ Review | Remove debug route or restrict |
| Build Process | ✅ Ready | `npm run build` works |
| Dependencies | ✅ Ready | Latest versions, no vulnerabilities |

## 🚀 Deployment Steps Summary

1. **Prepare server** - Install Node.js, MariaDB, Nginx
2. **Configure database** - Create DB, run schema, run seeds
3. **Build application**:
   - Backend: `npm ci --only=production && npm run build`
   - Frontend: `npm ci --only=production && npm run build`
4. **Configure environment** - Set production env vars
5. **Setup process manager** - PM2 for backend
6. **Configure reverse proxy** - Nginx with SSL
7. **Create admin user** - First user via database
8. **Setup backups** - Daily automated backups
9. **Enable monitoring** - PM2 monitoring, logs

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for detailed instructions.

## 🔍 Final Verification

Before going live, verify:

- [ ] All environment variables set correctly
- [ ] Database connection works
- [ ] SSL certificate valid
- [ ] Backups configured
- [ ] Admin user created
- [ ] Login works
- [ ] Can create change request
- [ ] Scoring calculations work
- [ ] CAB review workflow functions
- [ ] All dashboards load data

## 📝 Post-Deployment Tasks

1. Monitor application logs for errors
2. Verify scoring calculations with test data
3. Test CAB review workflow end-to-end
4. Confirm email notifications (if configured)
5. Train users on system
6. Create user documentation (if needed)

## 🆘 Rollback Plan

If issues occur:

1. **Database**: Restore from latest backup
2. **Application**: Revert git commit, rebuild
3. **Config**: Restore previous `.env` files
4. **Restart**: `pm2 restart all` and `systemctl restart nginx`

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) Section "Rollback Procedure" for details.

---

**Last Updated:** 2025-12-04
**System Version:** 1.0.0
**Ready for Production:** ✅ Yes (with optional cleanup items addressed)

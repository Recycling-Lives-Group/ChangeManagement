# Production Deployment Guide

This guide provides step-by-step instructions for deploying the Change Management System to a production server.

## Pre-Deployment Checklist

### Code Review
- ✅ No TODO/FIXME/PLACEHOLDER comments in production code
- ✅ No hardcoded localhost references (all use environment variables)
- ✅ All page components have routes defined
- ✅ No unused page files in repository

### Files to Clean Before Deployment
- Remove: `ChangeDetail.tsx`, `ChangeDetailSimple.tsx`, `DashboardSimple.tsx` (unused alternate versions)
- Remove: `backend/check-changes.js` (development script)
- Remove: Debug route from production (`/debug/changes/:id` in [App.tsx](frontend/src/App.tsx#L247-L257))

## Environment Setup

### 1. Production Server Requirements

**Minimum Requirements:**
- Node.js v18 or higher
- MariaDB 12.1 or MySQL 8.0+
- 2GB RAM minimum
- 10GB disk space
- SSL certificate for HTTPS

**Recommended:**
- 4GB RAM
- 20GB disk space
- Ubuntu 22.04 LTS or Windows Server 2022
- Nginx or Apache as reverse proxy

### 2. Database Setup

**Create Production Database:**
```sql
CREATE DATABASE change_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cmapp'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON change_management.* TO 'cmapp'@'localhost';
FLUSH PRIVILEGES;
```

**Run Schema:**
```bash
mysql -u cmapp -p change_management < backend/src/database/schema.sql
```

**Seed Benefit Scoring Config:**
```bash
mysql -u cmapp -p change_management < backend/src/database/seed-all-benefit-configs.sql
```

**Verify Tables:**
```bash
mysql -u cmapp -p -e "USE change_management; SHOW TABLES;"
```

Expected tables:
- users
- change_requests
- benefit_scoring_config
- effort_scoring_config
- cab_reviews
- change_history
- change_comments
- change_attachments
- notifications
- diagram_state

### 3. Backend Configuration

**Create `.env` file in backend directory:**
```env
NODE_ENV=production
PORT=5000

# Database - Use production credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=cmapp
DB_PASSWORD=your_strong_password_here
DB_NAME=change_management

# JWT - Generate with: openssl rand -base64 32
JWT_SECRET=your_production_jwt_secret_here_minimum_32_characters

# Frontend URL - Your production domain
FRONTEND_URL=https://yourdomain.com

# Email Configuration (if using)
SMTP_HOST=smtp.yourmailserver.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your_smtp_password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/www/cm-uploads
```

**Security Notes:**
- Use strong, unique passwords (minimum 32 characters)
- Generate JWT secret with: `openssl rand -base64 64`
- Never commit `.env` files to version control
- Store backups of `.env` securely

**Build Backend:**
```bash
cd backend
npm ci --only=production
npm run build
```

### 4. Frontend Configuration

**Create `.env` file in frontend directory:**
```env
VITE_API_URL=https://yourdomain.com/api
```

**Build Frontend:**
```bash
cd frontend
npm ci --only=production
npm run build
```

This creates optimized production files in `frontend/dist/`

## Deployment Options

### Option 1: Traditional Server (Ubuntu/Debian)

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MariaDB
sudo apt install -y mariadb-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2
```

#### Deploy Backend
```bash
# Create application directory
sudo mkdir -p /var/www/cm-backend
sudo chown $USER:$USER /var/www/cm-backend

# Copy backend files
cp -r backend/* /var/www/cm-backend/
cd /var/www/cm-backend

# Install dependencies and build
npm ci --only=production
npm run build

# Start with PM2
pm2 start dist/index.js --name "cm-backend"
pm2 save
pm2 startup
```

#### Deploy Frontend with Nginx
```bash
# Copy built frontend files
sudo mkdir -p /var/www/cm-frontend
sudo cp -r frontend/dist/* /var/www/cm-frontend/
```

**Nginx Configuration (`/etc/nginx/sites-available/cm`):**
```nginx
# Backend API
upstream cm_backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend (React SPA)
    root /var/www/cm-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://cm_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io support (for real-time features)
    location /socket.io {
        proxy_pass http://cm_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/cm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL Certificate (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
sudo systemctl reload nginx
```

### Option 2: Docker Deployment

**Create `docker-compose.yml` in project root:**
```yaml
version: '3.8'

services:
  database:
    image: mariadb:12.1
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: change_management
      MYSQL_USER: cmapp
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
      - ./backend/src/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./backend/src/database/seed-all-benefit-configs.sql:/docker-entrypoint-initdb.d/02-seed.sql
    ports:
      - "3306:3306"
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: database
      DB_PORT: 3306
      DB_USER: cmapp
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: change_management
      JWT_SECRET: ${JWT_SECRET}
      FRONTEND_URL: ${FRONTEND_URL}
    depends_on:
      - database
    ports:
      - "5000:5000"
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      VITE_API_URL: ${VITE_API_URL}
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  db_data:
```

**Backend Dockerfile (`backend/Dockerfile`):**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

**Frontend Dockerfile (`frontend/Dockerfile`):**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Deploy with Docker:**
```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### AWS Deployment
- **Backend**: AWS Elastic Beanstalk or ECS
- **Frontend**: S3 + CloudFront
- **Database**: RDS for MariaDB
- **SSL**: AWS Certificate Manager

#### DigitalOcean
- **Backend**: App Platform (Node.js)
- **Frontend**: App Platform (Static Site)
- **Database**: Managed MariaDB Database

#### Heroku
- **Backend**: Heroku Dyno
- **Frontend**: Heroku Static Buildpack or Netlify
- **Database**: JawsDB MySQL addon

## Post-Deployment

### 1. Create Admin User

**Via MySQL:**
```sql
-- Generate bcrypt hash for password (use bcrypt tool or create via API)
-- Example: password "Admin123!" hashed
INSERT INTO users (email, username, password_hash, first_name, last_name, role, department, is_active)
VALUES (
  'admin@yourdomain.com',
  'admin',
  '$2b$10$YourBcryptHashHere',
  'System',
  'Administrator',
  'admin',
  'IT',
  TRUE
);
```

**Via API (register then update role):**
```bash
# Register user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","username":"admin","password":"Admin123!","firstName":"System","lastName":"Administrator"}'

# Update role to admin via MySQL
mysql -u cmapp -p -e "UPDATE change_management.users SET role='admin' WHERE email='admin@yourdomain.com';"
```

### 2. Database Backups

**Setup automated daily backups (cron job):**
```bash
# Create backup script
sudo nano /usr/local/bin/cm-backup.sh
```

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/cm-database"
mkdir -p $BACKUP_DIR

mysqldump -u cmapp -p'YOUR_PASSWORD' change_management | gzip > $BACKUP_DIR/cm_backup_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "cm_backup_*.sql.gz" -mtime +30 -delete
```

```bash
sudo chmod +x /usr/local/bin/cm-backup.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/cm-backup.sh
```

### 3. Monitoring

**PM2 Monitoring:**
```bash
pm2 monit
pm2 logs cm-backend
```

**Application Health Checks:**
```bash
# Backend health
curl https://yourdomain.com/api/health

# Frontend
curl https://yourdomain.com/
```

### 4. SSL Certificate Renewal

Let's Encrypt certificates auto-renew via certbot timer:
```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

## Security Hardening

### Database Security
```sql
-- Remove remote root access
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Disable local file loading
SET GLOBAL local_infile = 0;

FLUSH PRIVILEGES;
```

### Firewall Configuration (Ubuntu)
```bash
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw status
```

### Application Security
- Enable CORS only for production domain
- Set secure HTTP headers in Nginx
- Use HTTPS only (no HTTP)
- Implement rate limiting
- Regular security updates: `sudo apt update && sudo apt upgrade`

## Troubleshooting

### Backend won't start
```bash
pm2 logs cm-backend
# Check database connection in .env
# Verify MariaDB is running: sudo systemctl status mariadb
```

### Frontend shows blank page
- Check browser console for API URL errors
- Verify VITE_API_URL in build
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Database connection errors
```bash
# Test database connection
mysql -u cmapp -p -h localhost change_management -e "SHOW TABLES;"

# Check MariaDB logs
sudo tail -f /var/log/mysql/error.log
```

### SSL issues
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal
```

## Maintenance

### Update Application
```bash
# Pull latest code
cd /var/www/cm-backend
git pull origin main

# Rebuild backend
npm ci --only=production
npm run build
pm2 restart cm-backend

# Rebuild frontend
cd /var/www/cm-frontend
git pull origin main
npm ci --only=production
npm run build
sudo cp -r dist/* /var/www/cm-frontend/
```

### Database Migrations
When schema changes:
```bash
# Backup first!
mysqldump -u cmapp -p change_management > backup_before_migration.sql

# Run new schema changes
mysql -u cmapp -p change_management < new_schema_changes.sql
```

## Performance Optimization

### Database Indexing
Already optimized indexes in schema for:
- Request numbers
- Status filtering
- Date ranges
- User queries

### Frontend Optimization
- Gzip compression enabled in Nginx
- Static asset caching
- Code splitting via Vite

### Backend Optimization
- Connection pooling enabled (mysql2)
- PM2 cluster mode for multiple cores:
```bash
pm2 start dist/index.js -i max --name cm-backend
```

## Support & Monitoring

### Logs Location
- **Backend**: `pm2 logs cm-backend` or `/home/user/.pm2/logs/`
- **Nginx**: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`
- **MariaDB**: `/var/log/mysql/error.log`

### Monitoring Tools (Optional)
- PM2 Plus for application monitoring
- New Relic or DataDog for full-stack monitoring
- Uptime monitoring: UptimeRobot, Pingdom

## Rollback Procedure

If deployment fails:
```bash
# Restore database from backup
gunzip < /var/backups/cm-database/cm_backup_YYYYMMDD_HHMMSS.sql.gz | mysql -u cmapp -p change_management

# Revert to previous code version
cd /var/www/cm-backend
git checkout previous-tag-or-commit
npm ci --only=production
npm run build
pm2 restart cm-backend
```

## Production URL Configuration Summary

**Files requiring production URL updates:**

1. **Backend `.env`**:
   - `FRONTEND_URL=https://yourdomain.com`

2. **Frontend `.env`**:
   - `VITE_API_URL=https://yourdomain.com/api`

3. **Nginx config**: Update `server_name yourdomain.com`

All code uses environment variables - no hardcoded localhost references remain.

## Database Schema Version

**Current Schema**: Includes all tables for full functionality
- Scoring: benefit_scoring_config, effort_scoring_config
- Change management: change_requests with wizard_data JSON
- Workflow: cab_reviews, change_history
- Future features: change_comments, change_attachments, notifications

Schema file: [backend/src/database/schema.sql](backend/src/database/schema.sql)

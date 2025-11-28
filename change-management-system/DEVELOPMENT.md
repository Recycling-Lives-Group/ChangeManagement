# Development Guide

This guide covers development workflows, architecture decisions, and how to extend the Change Management System.

## Architecture Overview

### Project Structure

```
change-management-system/
├── frontend/          # React SPA
└── backend/           # Express API server
```

The frontend and backend are separate applications that communicate via REST API.

### Technology Decisions

#### Frontend
- **React 19**: Latest features and performance
- **Vite**: Fast build tool with HMR
- **Zustand**: Lightweight state management (simpler than Redux)
- **React Hook Form + Zod**: Type-safe form validation
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Modern, consistent icon set

#### Backend
- **Express**: Minimal, flexible Node.js framework
- **mysql2**: MariaDB driver with promise support
- **JWT**: Stateless authentication
- **bcrypt**: Password hashing

#### Database
- **MariaDB**: Relational database with MySQL compatibility
- Schema design follows relational database best practices
- Indexes on frequently queried fields (status, email, dates)

## Development Workflow

### Running in Development

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend (separate terminal):**
```bash
cd frontend
npm run dev
```

The backend runs on http://localhost:5000 and the frontend on http://localhost:5173.

### Making Changes

#### Adding a New Feature

1. **Plan the feature**
   - Design database schema changes
   - Design API endpoints
   - Design UI components

2. **Database changes** (if needed)
   - Update SQL schema in `backend/src/database/schema.sql`
   - Run schema updates on your local MariaDB
   - Create seed data if needed

3. **Backend changes**
   - Add/update controllers in `backend/src/controllers/`
   - Add/update routes in `backend/src/routes/`
   - Update SQL queries in controllers

4. **Frontend changes**
   - Update API service calls in pages/components
   - Update Zustand store if needed in `frontend/src/store/`
   - Add/update components in `frontend/src/components/`
   - Add/update pages in `frontend/src/pages/`

5. **Test the feature**
   - Manual testing in browser
   - API testing with Postman/Thunder Client
   - Test with MariaDB data

#### Example: Adding a Comment Feature

**1. Update database schema:**
```sql
-- backend/src/database/schema.sql
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  change_request_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (change_request_id) REFERENCES change_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**2. Add backend route:**
```typescript
// backend/src/routes/changes.ts
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', protect, getComments);
```

**3. Add controller:**
```typescript
// backend/src/controllers/changeController.ts
export const addComment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;

  const [result] = await db.execute(
    'INSERT INTO comments (change_request_id, user_id, content) VALUES (?, ?, ?)',
    [id, userId, content]
  );

  res.json({ success: true, commentId: result.insertId });
};
```

**4. Create UI component:**
```typescript
// frontend/src/components/Comments.tsx
export default function Comments({ changeId }: { changeId: string }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async () => {
    await axios.post(`/api/changes/${changeId}/comments`, { content: newComment });
    // Refresh comments
  };

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>{comment.content}</div>
      ))}
      <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} />
      <button onClick={handleSubmit}>Add Comment</button>
    </div>
  );
}
```

### Database Management

#### Accessing MariaDB

**Local MariaDB:**
```bash
mysql -u root -p
USE change_management;
```

**Common queries:**
```sql
-- View all users
SELECT * FROM users;

-- View all change requests
SELECT * FROM change_requests;

-- Update user role
UPDATE users
SET role = 'Admin'
WHERE email = 'user@example.com';

-- Delete all change requests (careful!)
DELETE FROM change_requests;

-- View table structure
DESCRIBE users;
DESCRIBE change_requests;
```

#### Seeding Test Data

**Using SQL seed files:**
```bash
mysql -u root -p change_management < backend/src/database/seed-all-benefit-configs.sql
```

**Creating custom seed data:**
```sql
-- custom-seed.sql
INSERT INTO users (email, password, name, department, phone, role)
VALUES ('admin@test.com', '$2b$10$...', 'Admin User', 'IT', '+1234567890', 'Admin');

INSERT INTO change_requests (title, description, status, user_id, wizard_data)
VALUES (
  'Test Change',
  'Test description',
  'Draft',
  1,
  '{}'
);
```

Run with:
```bash
mysql -u root -p change_management < custom-seed.sql
```

## Code Style & Best Practices

### TypeScript

- Always use explicit types
- Avoid `any` - use `unknown` if truly needed
- Use interfaces for objects, types for unions/intersections
- Define types inline or in separate type files when needed

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use custom hooks for reusable logic
- Prefer composition over props drilling

**Good:**
```typescript
function UserProfile({ userId }: { userId: string }) {
  const { user, isLoading } = useUser(userId);

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <NotFound />;

  return <UserCard user={user} />;
}
```

### API Design

- RESTful endpoints
- Consistent response format
- Proper HTTP status codes
- Error handling with meaningful messages

**Response format:**
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}
```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

Example test:
```typescript
// backend/src/controllers/__tests__/auth.test.ts
import { register } from '../authController';

describe('Auth Controller', () => {
  it('should register a new user', async () => {
    // Test implementation
  });
});
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Debugging

### Backend Debugging

Add debug logs:
```typescript
console.log('[DEBUG] User login attempt:', email);
```

Use VS Code debugger:
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "preLaunchTask": "tsc: build - backend/tsconfig.json",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
    }
  ]
}
```

### Frontend Debugging

- Use React DevTools browser extension
- Use Zustand DevTools: `import { devtools } from 'zustand/middleware'`
- Console logs: `console.log('[Component] Rendering with:', props)`
- Network tab in browser DevTools for API calls

## Performance Optimization

### Backend
- Add database indexes for frequent queries
- Use pagination for large datasets
- Cache frequently accessed data with Redis
- Use compression middleware

### Frontend
- Code splitting with React.lazy()
- Memoize expensive computations with useMemo
- Virtualize long lists with react-window
- Optimize images and assets

## Security Best Practices

### Authentication
- Never store passwords in plain text (using bcrypt)
- Use strong JWT secrets (generate with `openssl rand -base64 32`)
- Set appropriate token expiration
- Implement refresh tokens for longer sessions

### API Security
- Validate all input data (using Zod)
- Sanitize user input to prevent XSS
- Use HTTPS in production
- Implement rate limiting
- Add CORS properly

### Database Security
- Use environment variables for credentials
- Never commit .env files
- Use MariaDB user permissions and access control
- Regular backups with mysqldump
- Enable SSL/TLS for database connections in production

## Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway/DigitalOcean)

```bash
cd backend
npm run build
npm start
```

Set environment variables on hosting platform.

### Database (MariaDB Production)

1. Set up MariaDB on production server or use managed service (AWS RDS, DigitalOcean)
2. Configure firewall to allow only application server IPs
3. Update DATABASE_URL in production environment
4. Enable automated backups
5. Set up SSL/TLS connections

## Extending the System

### Adding a New User Role

1. Update SQL schema to add new role to ENUM in users table
2. Update backend role checks in middleware
3. Update frontend role checks in components
4. Add role-specific permissions

### Adding Email Notifications

1. Configure SMTP in backend/.env
2. Create email service in `backend/src/services/email.ts`
3. Use nodemailer to send emails
4. Create email templates

## Troubleshooting Development Issues

### Hot Reload Not Working

**Frontend:**
- Restart Vite dev server
- Check for TypeScript errors
- Clear browser cache

**Backend:**
- Restart tsx watch
- Check for syntax errors
- Ensure tsx is installed

### TypeScript Errors

Check for syntax errors and restart the dev server:
```bash
# Restart backend
cd backend
npm run dev

# Restart frontend
cd frontend
npm run dev
```

### CORS Errors

Ensure backend allows frontend origin:
```typescript
app.use(cors({ origin: 'http://localhost:5173' }));
```

## Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Express Documentation](https://expressjs.com/)
- [MariaDB Documentation](https://mariadb.org/documentation/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Flow](https://reactflow.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)

## Getting Help

- Check existing issues in the repository
- Read error messages carefully
- Use console.log liberally
- Check network tab for API issues
- Review MariaDB logs for database issues
- Check backend terminal for server errors
- Use the Debug page (`/debug/changes/:id`) to inspect change request data

## Contributing

See CONTRIBUTING.md for contribution guidelines.

# Development Guide

This guide covers development workflows, architecture decisions, and how to extend the Change Management System.

## Architecture Overview

### Monorepo Structure

This project uses **npm workspaces** for managing multiple packages:

```
change-management-system/
├── frontend/          # React SPA
├── backend/           # Express API server
└── shared/types/      # Shared TypeScript types
```

Benefits:
- Shared types between frontend and backend
- Single `npm install` for all packages
- Consistent tooling and dependencies

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
- **Mongoose**: MongoDB ODM with TypeScript support
- **JWT**: Stateless authentication
- **Socket.io**: Real-time bidirectional communication

#### Database
- **MongoDB**: Document database perfect for flexible schemas
- Schema design balances normalization and denormalization
- Indexes on frequently queried fields (status, email, dates)

## Development Workflow

### Running in Development

#### Full Stack (Recommended)
```bash
npm run dev
```

#### Frontend Only
```bash
cd frontend
npm run dev
```

#### Backend Only
```bash
cd backend
npm run dev
```

### Making Changes

#### Adding a New Feature

1. **Plan the feature**
   - Update shared types if needed
   - Design API endpoints
   - Design UI components

2. **Update shared types** (if needed)
   ```bash
   cd shared/types/src
   # Edit index.ts
   npm run build
   ```

3. **Backend changes**
   - Add/update models in `backend/src/models/`
   - Add/update controllers in `backend/src/controllers/`
   - Add/update routes in `backend/src/routes/`
   - Add/update services in `backend/src/services/`

4. **Frontend changes**
   - Update API service in `frontend/src/services/api.ts`
   - Update store if needed in `frontend/src/store/`
   - Add/update components in `frontend/src/components/`
   - Add/update pages in `frontend/src/pages/`

5. **Test the feature**
   - Manual testing in browser
   - API testing with Postman/Thunder Client
   - Write unit/integration tests

#### Example: Adding a Comment Feature

**1. Update shared types:**
```typescript
// shared/types/src/index.ts
export interface Comment {
  id: string;
  changeRequestId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}
```

**2. Update backend model:**
```typescript
// backend/src/models/ChangeRequest.ts
comments: [{
  id: String,
  userId: String,
  userName: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
}]
```

**3. Add backend route:**
```typescript
// backend/src/routes/changes.ts
router.post('/:id/comments', protect, addComment);
```

**4. Add controller:**
```typescript
// backend/src/controllers/changeController.ts
export const addComment = async (req: AuthRequest, res: Response) => {
  // Implementation
};
```

**5. Update frontend API:**
```typescript
// frontend/src/services/api.ts
addComment: async (changeId: string, content: string) => {
  const response = await api.post(`/changes/${changeId}/comments`, { content });
  return response.data;
}
```

**6. Update store:**
```typescript
// frontend/src/store/changesStore.ts
addComment: async (changeId: string, content: string) => {
  await changesApi.addComment(changeId, content);
  get().fetchChange(changeId);
}
```

**7. Create UI component:**
```typescript
// frontend/src/components/Comments.tsx
export default function Comments({ changeId }: { changeId: string }) {
  // Component implementation
}
```

### Database Management

#### Accessing MongoDB

**Local MongoDB:**
```bash
mongosh
use change-management
```

**Common queries:**
```javascript
// View all users
db.users.find().pretty()

// View all change requests
db.changerequests.find().pretty()

// Update user role
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "Admin" } }
)

// Delete all change requests (careful!)
db.changerequests.deleteMany({})
```

#### Seeding Test Data

Create a seed script:

```javascript
// backend/src/scripts/seed.ts
import { User } from '../models/User';
import { ChangeRequest } from '../models/ChangeRequest';

async function seed() {
  // Create test users
  await User.create({
    email: 'admin@test.com',
    password: 'password123',
    name: 'Admin User',
    department: 'IT',
    phone: '+1234567890',
    role: 'Admin'
  });

  // Create test change requests
  await ChangeRequest.create({
    // ... change request data
  });
}

seed();
```

Run with:
```bash
cd backend
npx tsx src/scripts/seed.ts
```

## Code Style & Best Practices

### TypeScript

- Always use explicit types
- Avoid `any` - use `unknown` if truly needed
- Use interfaces for objects, types for unions/intersections
- Export types from shared package

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
- Use MongoDB access control
- Regular backups

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

### Database (MongoDB Atlas)

1. Create production cluster
2. Whitelist application IPs
3. Update MONGODB_URI
4. Enable backup

## Extending the System

### Adding a New User Role

1. Update type in `shared/types/src/index.ts`
2. Add to User model enum
3. Add permissions in `getPermissions()` method
4. Update frontend role checks

### Adding Socket.io Events

1. Define event type in shared types
2. Emit from backend: `io.to(room).emit('event', data)`
3. Listen in frontend: `socket.on('event', handler)`

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

### TypeScript Errors After Adding Types

```bash
cd shared/types
npm run build
cd ../../frontend
# or
cd ../../backend
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
- [Mongoose Documentation](https://mongoosejs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Help

- Check existing issues in the repository
- Read error messages carefully
- Use console.log liberally
- Check network tab for API issues
- Review MongoDB logs for database issues

## Contributing

See CONTRIBUTING.md for contribution guidelines.

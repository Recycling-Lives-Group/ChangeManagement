import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import changeRoutes from './routes/changes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST'],
  },
});

// Connect to database
connectDatabase();

// Middleware
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/changes', changeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Subscribe to change updates
  socket.on('subscribe:change', (changeId: string) => {
    socket.join(`change:${changeId}`);
  });

  socket.on('unsubscribe:change', (changeId: string) => {
    socket.leave(`change:${changeId}`);
  });
});

// Make io accessible to controllers
app.set('io', io);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: err.message || 'Server Error',
    },
  });
});

const PORT = config.port;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${config.env} mode on port ${PORT}`);
});

export { io };

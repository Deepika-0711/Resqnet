const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from root .env or local .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const db = require('./config/db');
const { initSocket } = require('./services/socketService');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Enable CORS for REST and WebSockets
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 2. Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});
initSocket(io);

// 3. Ensure database schema is ready
db.initSchema();
const countRow = db.get('SELECT COUNT(*) as count FROM ambulances');
if (!countRow || countRow.count === 0) {
  console.log('[RESQNET] Database empty. Running initial seed...');
  require('./seed')();
}

// 4. API Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'RESQNET Emergency Coordination Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0-bharat-infra'
  });
});

app.use('/api', apiRoutes);

// 5. Centralized Error Handler
app.use(errorHandler);

// 6. Start Server
server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚑 RESQNET COORDINATION SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 Socket.IO Real-time Engine initialized`);
  console.log(`🏥 Healthcheck: http://localhost:${PORT}/health`);
  console.log('====================================================');
});

process.on('SIGINT', () => {
  console.log('\n[RESQNET] Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

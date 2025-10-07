const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());
app.use(morgan('combined'));

// CORS
app.use(cors({
  origin: ['http://104.131.96.162:4200', 'http://104.131.96.162:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000 // máximo 1000 requests por ventana
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));

// Configuración de servicios
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  teams: process.env.TEAMS_SERVICE_URL || 'http://teams-service:3002',
  players: process.env.PLAYERS_SERVICE_URL || 'http://players-service:80',
  matches: process.env.MATCHES_SERVICE_URL || 'http://basketball-api:8080',
  reports: process.env.REPORTS_SERVICE_URL || 'http://report-service:8000'
};

// Middleware de logging para requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas del API Gateway
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Basketball API Gateway',
    version: '1.0.0',
    services: {
      auth: `${services.auth}/api/auth`,
      teams: `${services.teams}/api/teams`,
      players: `${services.players}/api/players`,
      matches: `${services.matches}/api`,
      reports: `${services.reports}/api/reports`
    },
    endpoints: {
      'POST /auth/login': 'Autenticación',
      'GET /teams': 'Gestión de equipos',
      'GET /players': 'Gestión de jugadores',
      'GET /matches': 'Gestión de partidos',
      'GET /reports/equipos': 'Reportes PDF'
    }
  });
});

// Health check del gateway
app.get('/health', async (req, res) => {
  const healthChecks = {};
  
  // Verificar estado de cada servicio
  const axios = require('axios');
  
  try {
    // Auth Service
    try {
      await axios.get(`${services.auth}/health`, { timeout: 5000 });
      healthChecks.auth = 'UP';
    } catch (error) {
      healthChecks.auth = 'DOWN';
    }

    // Teams Service
    try {
      await axios.get(`${services.teams}/api/teams/health`, { timeout: 5000 });
      healthChecks.teams = 'UP';
    } catch (error) {
      healthChecks.teams = 'DOWN';
    }

    // Players Service
    try {
      await axios.get(`${services.players}/api/health`, { timeout: 5000 });
      healthChecks.players = 'UP';
    } catch (error) {
      healthChecks.players = 'DOWN';
    }

    // Matches Service
    try {
      await axios.get(`${services.matches}/health`, { timeout: 5000 });
      healthChecks.matches = 'UP';
    } catch (error) {
      healthChecks.matches = 'DOWN';
    }

    // Reports Service
    try {
      await axios.get(`${services.reports}/health`, { timeout: 5000 });
      healthChecks.reports = 'UP';
    } catch (error) {
      healthChecks.reports = 'DOWN';
    }

    res.json({
      status: 'UP',
      gateway: 'basketball-api-gateway',
      timestamp: new Date().toISOString(),
      services: healthChecks
    });

  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      services: healthChecks
    });
  }
});

// Proxy para Auth Service
app.use('/auth', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/api/auth'
  },
  onError: (err, req, res) => {
    console.error('Auth Service Error:', err.message);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
}));

// Proxy para Teams Service
app.use('/teams', createProxyMiddleware({
  target: services.teams,
  changeOrigin: true,
  pathRewrite: {
    '^/teams': '/api/teams'
  },
  onError: (err, req, res) => {
    console.error('Teams Service Error:', err.message);
    res.status(503).json({ error: 'Teams service unavailable' });
  }
}));

// Proxy para Players Service
app.use('/players', createProxyMiddleware({
  target: services.players,
  changeOrigin: true,
  pathRewrite: {
    '^/players': '/api/players'
  },
  onError: (err, req, res) => {
    console.error('Players Service Error:', err.message);
    res.status(503).json({ error: 'Players service unavailable' });
  }
}));

// Proxy para Matches Service (Basketball API)
app.use('/matches', createProxyMiddleware({
  target: services.matches,
  changeOrigin: true,
  pathRewrite: {
    '^/matches': '/api'
  },
  onError: (err, req, res) => {
    console.error('Matches Service Error:', err.message);
    res.status(503).json({ error: 'Matches service unavailable' });
  }
}));

// Proxy para Reports Service
app.use('/reports', createProxyMiddleware({
  target: services.reports,
  changeOrigin: true,
  pathRewrite: {
    '^/reports': '/api/reports'
  },
  onError: (err, req, res) => {
    console.error('Reports Service Error:', err.message);
    res.status(503).json({ error: 'Reports service unavailable' });
  }
}));

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Gateway Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal Gateway Error',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    available_routes: ['/auth', '/teams', '/players', '/matches', '/reports', '/health']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Services: ${Object.keys(services).join(', ')}`);
});

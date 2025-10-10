const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'basketball-secret-key-2024';

// Middleware para autenticar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Token inválido o usuario inactivo'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile
    };

    next();

  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Middleware para requerir un rol específico
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere rol: ${requiredRole}`
      });
    }

    next();
  };
};

// Middleware para requerir múltiples roles
const requireAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de los roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware para verificar permisos específicos
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Usuario no autenticado'
        });
      }

      // Admin tiene todos los permisos
      if (req.user.role === 'admin') {
        return next();
      }

      // Buscar usuario completo para verificar permisos
      const user = await User.findById(req.user.id);
      
      if (!user || !user.hasPermission(resource, action)) {
        return res.status(403).json({
          error: `Acceso denegado. Se requiere permiso: ${action} en ${resource}`
        });
      }

      next();

    } catch (error) {
      console.error('Error verificando permisos:', error);
      return res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  };
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    
    if (user && user.isActive) {
      req.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      };
    } else {
      req.user = null;
    }

    next();

  } catch (error) {
    // En caso de error, continuar sin usuario autenticado
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAnyRole,
  requirePermission,
  optionalAuth
};

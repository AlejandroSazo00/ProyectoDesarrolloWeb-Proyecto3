const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Obtener todos los usuarios (solo admin)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    
    // Construir filtros
    const filters = {};
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    // Paginación
    const skip = (page - 1) * limit;
    
    const users = await User.find(filters)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filters);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/users/profile - Obtener perfil del usuario actual
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/users/profile - Actualizar perfil del usuario actual
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { profile, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Actualizar campos permitidos
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }
    
    if (email && email !== user.email) {
      // Verificar que el email no esté en uso
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(409).json({
          error: 'El email ya está en uso'
        });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/users/:id - Obtener usuario por ID (solo admin)
router.get('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/users/:id - Actualizar usuario (solo admin)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { role, isActive, profile } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Actualizar campos permitidos para admin
    if (role && ['admin', 'user', 'moderator'].includes(role)) {
      user.role = role;
    }
    
    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    await user.save();

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // No permitir que el admin se elimine a sí mismo
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        error: 'No puedes eliminar tu propia cuenta'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/users/stats/summary - Estadísticas de usuarios (solo admin)
router.get('/stats/summary', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        admins: adminUsers,
        recentRegistrations: recentUsers
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;

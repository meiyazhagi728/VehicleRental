const { cache } = require('../config/redis');

// Track active users
const activeUsers = new Map();

// Middleware to track concurrent users
const trackConcurrentUsers = (req, res, next) => {
  if (req.user) {
    const userId = req.user._id.toString();
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;
    
    // Update user activity
    activeUsers.set(userId, {
      userId,
      lastActivity: new Date(),
      userAgent,
      ip,
      role: req.user.role
    });

    // Clean up inactive users (older than 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    for (const [id, user] of activeUsers.entries()) {
      if (user.lastActivity < thirtyMinutesAgo) {
        activeUsers.delete(id);
      }
    }

    // Update online users count in cache
    cache.setOnlineUsers(activeUsers.size);
  }
  
  next();
};

// Middleware to check if user is already logged in elsewhere
const checkConcurrentLogin = async (req, res, next) => {
  if (req.user) {
    const userId = req.user._id.toString();
    const currentSession = await cache.getUserSession(userId);
    
    if (currentSession && currentSession.sessionId !== req.sessionID) {
      // User is logged in elsewhere
      return res.status(409).json({
        message: 'You are already logged in on another device',
        code: 'CONCURRENT_LOGIN'
      });
    }
  }
  
  next();
};

// Middleware to prevent double booking
const preventDoubleBooking = async (req, res, next) => {
  if (req.body.vehicleId) {
    const vehicleId = req.body.vehicleId;
    const userId = req.user._id.toString();
    
    // Check if user has a pending booking for this vehicle
    const pendingBookingKey = `pending_booking:${userId}:${vehicleId}`;
    const existingBooking = await cache.get(pendingBookingKey);
    
    if (existingBooking) {
      return res.status(409).json({
        message: 'You already have a pending booking for this vehicle',
        code: 'DOUBLE_BOOKING'
      });
    }
    
    // Set a temporary lock for 5 minutes
    await cache.set(pendingBookingKey, {
      userId,
      vehicleId,
      timestamp: new Date()
    }, 300);
  }
  
  next();
};

// Middleware to handle optimistic locking for vehicle updates
const optimisticLocking = async (req, res, next) => {
  if (req.method === 'PUT' && req.params.id) {
    const vehicleId = req.params.id;
    const lockKey = `lock:vehicle:${vehicleId}`;
    
    // Try to acquire lock
    const lockValue = Date.now().toString();
    const lockAcquired = await cache.set(lockKey, lockValue, 30); // 30 seconds lock
    
    if (!lockAcquired) {
      return res.status(409).json({
        message: 'Vehicle is being updated by another user. Please try again.',
        code: 'OPTIMISTIC_LOCK'
      });
    }
    
    // Store lock info in request for cleanup
    req.vehicleLock = { key: lockKey, value: lockValue };
  }
  
  next();
};

// Cleanup middleware to release locks
const releaseLocks = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Release vehicle lock if it exists
    if (req.vehicleLock) {
      cache.del(req.vehicleLock.key);
    }
    
    // Release booking lock if it exists
    if (req.body.vehicleId && req.user) {
      const pendingBookingKey = `pending_booking:${req.user._id}:${req.body.vehicleId}`;
      cache.del(pendingBookingKey);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Get active users statistics
const getActiveUsersStats = () => {
  const stats = {
    total: activeUsers.size,
    byRole: {},
    recentActivity: []
  };
  
  for (const [userId, user] of activeUsers.entries()) {
    // Count by role
    stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
    
    // Recent activity (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (user.lastActivity > fiveMinutesAgo) {
      stats.recentActivity.push({
        userId: user.userId,
        role: user.role,
        lastActivity: user.lastActivity,
        ip: user.ip
      });
    }
  }
  
  return stats;
};

// Cleanup inactive users periodically
setInterval(() => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  for (const [id, user] of activeUsers.entries()) {
    if (user.lastActivity < thirtyMinutesAgo) {
      activeUsers.delete(id);
    }
  }
  
  // Update cache
  cache.setOnlineUsers(activeUsers.size);
}, 5 * 60 * 1000); // Every 5 minutes

module.exports = {
  trackConcurrentUsers,
  checkConcurrentLogin,
  preventDoubleBooking,
  optimisticLocking,
  releaseLocks,
  getActiveUsersStats,
  activeUsers
};

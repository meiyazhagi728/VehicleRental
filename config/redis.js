const redis = require('redis');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true
};

// Create Redis client
const redisClient = redis.createClient(redisConfig);

// Redis event handlers
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
});

redisClient.on('end', () => {
  console.log('Redis Client Disconnected');
});

// Session store configuration
const sessionConfig = {
  store: require('connect-redis')({
    client: redisClient,
    prefix: 'sess:',
    ttl: 86400 // 24 hours
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 86400000 // 24 hours
  }
};

// Cache helper functions
const cache = {
  // Set cache with TTL
  async set(key, value, ttl = 3600) {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setEx(key, ttl, serializedValue);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  // Get cache
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache
  async del(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },

  // Set cache for user sessions
  async setUserSession(userId, sessionData, ttl = 86400) {
    await this.set(`user:${userId}`, sessionData, ttl);
  },

  // Get user session
  async getUserSession(userId) {
    return await this.get(`user:${userId}`);
  },

  // Delete user session
  async deleteUserSession(userId) {
    await this.del(`user:${userId}`);
  },

  // Set online users count
  async setOnlineUsers(count) {
    await this.set('online_users', count, 60); // 1 minute TTL
  },

  // Get online users count
  async getOnlineUsers() {
    return await this.get('online_users') || 0;
  },

  // Set vehicle availability cache
  async setVehicleAvailability(vehicleId, isAvailable) {
    await this.set(`vehicle:${vehicleId}:available`, isAvailable, 300); // 5 minutes TTL
  },

  // Get vehicle availability cache
  async getVehicleAvailability(vehicleId) {
    return await this.get(`vehicle:${vehicleId}:available`);
  },

  // Set mechanic availability cache
  async setMechanicAvailability(mechanicId, isAvailable) {
    await this.set(`mechanic:${mechanicId}:available`, isAvailable, 300); // 5 minutes TTL
  },

  // Get mechanic availability cache
  async getMechanicAvailability(mechanicId) {
    return await this.get(`mechanic:${mechanicId}:available`);
  },

  // Set dashboard data cache
  async setDashboardData(data, ttl = 300) {
    await this.set('dashboard_data', data, ttl);
  },

  // Get dashboard data cache
  async getDashboardData() {
    return await this.get('dashboard_data');
  },

  // Clear all caches
  async clearAll() {
    try {
      await redisClient.flushAll();
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  }
};

module.exports = {
  redisClient,
  sessionConfig,
  cache
};

// Cache management utilities
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  // Set cache with TTL
  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  // Get cache value
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  // Delete cache entry
  delete(key) {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
  }

  // Clear cache by pattern
  clearByPattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache size
  size() {
    return this.cache.size;
  }

  // Get cache keys
  keys() {
    return Array.from(this.cache.keys());
  }

  // Check if key exists
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Create global cache instance
const cacheManager = new CacheManager();

// Cache keys constants
export const CACHE_KEYS = {
  VEHICLES: 'vehicles',
  MECHANICS: 'mechanics',
  USER_PROFILE: 'user_profile',
  BOOKINGS: 'bookings',
  VEHICLE_DETAIL: 'vehicle_detail',
  MECHANIC_DETAIL: 'mechanic_detail'
};

// Cache utilities
export const cache = {
  // Set cache
  set: (key, value, ttl) => cacheManager.set(key, value, ttl),
  
  // Get cache
  get: (key) => cacheManager.get(key),
  
  // Delete cache
  delete: (key) => cacheManager.delete(key),
  
  // Clear all cache
  clear: () => cacheManager.clear(),
  
  // Clear cache by pattern
  clearByPattern: (pattern) => cacheManager.clearByPattern(pattern),
  
  // Clear vehicles cache
  clearVehicles: () => {
    cacheManager.delete(CACHE_KEYS.VEHICLES);
    cacheManager.clearByPattern('^vehicle_');
  },
  
  // Clear mechanics cache
  clearMechanics: () => {
    cacheManager.delete(CACHE_KEYS.MECHANICS);
    cacheManager.clearByPattern('^mechanic_');
  },
  
  // Clear user cache
  clearUser: () => {
    cacheManager.delete(CACHE_KEYS.USER_PROFILE);
  },
  
  // Clear bookings cache
  clearBookings: () => {
    cacheManager.delete(CACHE_KEYS.BOOKINGS);
  },
  
  // Clear all data cache
  clearAllData: () => {
    cacheManager.clearByPattern('^(vehicles|mechanics|bookings|user_)');
  }
};

// Cache middleware for API calls
export const withCache = (apiCall, cacheKey, ttl = 5 * 60 * 1000) => {
  return async (...args) => {
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Make API call
    const result = await apiCall(...args);
    
    // Cache the result
    cache.set(cacheKey, result, ttl);
    
    return result;
  };
};

// Cache invalidation helpers
export const invalidateCache = {
  onLogin: () => {
    cache.clearUser();
    cache.clearAllData();
  },
  
  onLogout: () => {
    cache.clear();
  },
  
  onVehicleUpdate: (vehicleId) => {
    cache.clearVehicles();
    cache.delete(`${CACHE_KEYS.VEHICLE_DETAIL}_${vehicleId}`);
  },
  
  onMechanicUpdate: (mechanicId) => {
    cache.clearMechanics();
    cache.delete(`${CACHE_KEYS.MECHANIC_DETAIL}_${mechanicId}`);
  },
  
  onBookingUpdate: () => {
    cache.clearBookings();
  }
};

export default cacheManager;

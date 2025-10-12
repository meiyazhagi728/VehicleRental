// Safe localStorage utility functions

export const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === 'null' || item === 'undefined') {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing localStorage item "${key}":`, error);
    // Clear invalid data
    localStorage.removeItem(key);
    return defaultValue;
  }
};

export const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage "${key}":`, error);
    return false;
  }
};

export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage "${key}":`, error);
    return false;
  }
};

export const clearAllStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// User-specific localStorage functions
export const getUserFromStorage = () => {
  const user = safeGetItem('user');
  if (user && user.token) {
    // Validate token format
    if (typeof user.token === 'string' && user.token.split('.').length === 3) {
      return user;
    } else {
      console.warn('Invalid token format detected, clearing user data');
      removeUserFromStorage();
      return null;
    }
  }
  return user;
};

export const saveUserToStorage = (user) => {
  if (user && user.token) {
    // Validate token format before saving
    if (typeof user.token === 'string' && user.token.split('.').length === 3) {
      return safeSetItem('user', user);
    } else {
      console.error('Invalid token format, not saving user data');
      return false;
    }
  }
  return safeSetItem('user', user);
};

export const removeUserFromStorage = () => {
  return safeRemoveItem('user');
};

// Check if localStorage is available
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};
